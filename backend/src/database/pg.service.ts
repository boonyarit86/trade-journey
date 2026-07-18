import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { connectPg } from './pg-connection';
import { Pool } from 'pg';

@Injectable()
export class PgService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PgService.name);
    private pool: Pool;

    async onModuleInit() {
        this.pool = await connectPg();
        this.attachErrorHandler();
    }

    async onModuleDestroy() {
        await this.pool.end();
    }

    getPool(): Pool {
        return this.pool;
    }

    private attachErrorHandler() {
        this.pool.on('error', (err) => {
            // An idle client in the pool lost its connection unexpectedly.
            // pg.Pool automatically replaces the broken client on the next query,
            // so we only need to log the event and prevent Node.js from crashing.
            this.logger.error('Unexpected database connection error — pool will reconnect automatically', err.message);
        });
    }
}