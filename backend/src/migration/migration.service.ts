import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { PgService } from 'src/database/pg.service';

@Injectable()
export class MigrationService implements OnApplicationBootstrap {
    private readonly logger = new Logger(MigrationService.name);
    private readonly migrationDir = join(__dirname);

    constructor(private readonly pgService: PgService) {}

    async onApplicationBootstrap() {
        await this.runMigrations();
    }

    async runMigrations(): Promise<{ applied: string[]; skipped: string[] }> {
        const pool = this.pgService.getPool();
        await this.ensureMigrationsTable();

        const applied: string[] = [];
        const skipped: string[] = [];

        const executed = await this.getExecutedMigrations();
        const pending = await this.getPendingMigrations(executed);

        for (const name of pending) {
            const filePath = join(this.migrationDir, name);
            const sql = await readFile(filePath, 'utf-8');
            const client = await pool.connect();

            try {
                await client.query('BEGIN');
                await client.query(sql);
                await client.query(
                    'INSERT INTO "public"."schema_migrations" ("name") VALUES ($1)',
                    [name],
                );
                await client.query('COMMIT');
                applied.push(name);
                this.logger.log(`Applied migration: ${name}`);
            } catch (error) {
                await client.query('ROLLBACK');
                this.logger.error(`Failed migration: ${name}`, error);
                throw error;
            } finally {
                client.release();
            }
        }

        for (const name of executed) {
            skipped.push(name);
        }

        if (applied.length === 0) {
            this.logger.log('No pending migrations');
        } else {
            this.logger.log(`Applied ${applied.length} migration(s)`);
        }

        return { applied, skipped };
    }

    private async ensureMigrationsTable() {
        const pool = this.pgService.getPool();
        await pool.query(`
            CREATE TABLE IF NOT EXISTS "public"."schema_migrations" (
                "id" serial PRIMARY KEY,
                "name" varchar(255) NOT NULL UNIQUE,
                "executed_at" timestamp NOT NULL DEFAULT NOW()
            );
        `);
    }

    private async getExecutedMigrations(): Promise<string[]> {
        const pool = this.pgService.getPool();
        const result = await pool.query<{ name: string }>(
            'SELECT "name" FROM "public"."schema_migrations" ORDER BY "name"',
        );
        return result.rows.map((row) => row.name);
    }

    private async getPendingMigrations(executed: string[]): Promise<string[]> {
        const executedSet = new Set(executed);
        const files = await readdir(this.migrationDir);
        return files
            .filter((file) => file.endsWith('.sql'))
            .sort()
            .filter((file) => !executedSet.has(file));
    }
}
