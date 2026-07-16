import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IStrategyChecklist, IStrategyChecklistRow } from './strategy-checklist.interface';
import { CreateStrategyChecklistDto } from './dto/create-strategy-checklist.dto';
import { UpdateStrategyChecklistActiveStatusDto, UpdateStrategyChecklistDto } from './dto/update-strategy-checklist.dto';

@Injectable()
export class StrategyChecklistService {
    constructor(private readonly pgService: PgService) {}

    async getAllStrategyChecklists() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT * FROM "trading_setup"."TD04_StrategyChecklist" ORDER BY "TD04_CreatedAt"`
        );
        const rows: IStrategyChecklistRow[] = result.rows;
        const items: IStrategyChecklist[] = rows.map((r) => ({
            checklistId: r.TD02_Id,
            strategyId: r.TD03_Id,
            isActive: r.TD04_IsActive,
            isRequired: r.TD04_IsRequired,
            createdBy: r.TD04_CreatedBy,
            createdAt: r.TD04_CreatedAt,
            modifiedBy: r.TD04_ModifiedBy,
            modifiedAt: r.TD04_ModifiedAt,
        }));
        return {
            total: result.rowCount,
            data: items,
        };
    }

    async getStrategyChecklistsByStrategyId(strategyId: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT * FROM "trading_setup"."TD04_StrategyChecklist" WHERE "TD03_Id" = $1 ORDER BY "TD04_CreatedAt"`,
            [strategyId]
        );
        const rows: IStrategyChecklistRow[] = result.rows;
        const items: IStrategyChecklist[] = rows.map((r) => ({
            checklistId: r.TD02_Id,
            strategyId: r.TD03_Id,
            isActive: r.TD04_IsActive,
            isRequired: r.TD04_IsRequired,
            createdBy: r.TD04_CreatedBy,
            createdAt: r.TD04_CreatedAt,
            modifiedBy: r.TD04_ModifiedBy,
            modifiedAt: r.TD04_ModifiedAt,
        }));
        return {
            total: result.rowCount,
            data: items,
        };
    }

    async createStrategyChecklist(body: CreateStrategyChecklistDto) {
        const pool = this.pgService.getPool();
        const authorName = 'admin';

        const strategyCheck = await pool.query(
            `SELECT "TD03_Id" FROM "trading_setup"."TD03_Strategy" WHERE "TD03_Id" = $1`,
            [body.strategyId]
        );
        if (strategyCheck.rows.length === 0) {
            throw new Error('Strategy not found');
        }

        const checklistCheck = await pool.query(
            `SELECT "TD02_Id", "TD02_IsRequired" FROM "trading_setup"."TD02_Checklist" WHERE "TD02_Id" = $1`,
            [body.checklistId]
        );
        if (checklistCheck.rows.length === 0) {
            throw new Error('Checklist not found');
        }

        const isRequired = body.isRequired !== undefined
            ? body.isRequired
            : checklistCheck.rows[0].TD02_IsRequired;

        await pool.query(
            `INSERT INTO "trading_setup"."TD04_StrategyChecklist"
            ("TD02_Id", "TD03_Id", "TD04_IsRequired", "TD04_CreatedBy", "TD04_ModifiedBy")
            VALUES ($1, $2, $3, $4, $5)`,
            [body.checklistId, body.strategyId, isRequired, authorName, authorName]
        );

        return {
            data: {
                strategyId: body.strategyId,
                checklistId: body.checklistId,
            },
        };
    }

    async updateStrategyChecklist(body: UpdateStrategyChecklistDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            const result = await client.query(
                `UPDATE "trading_setup"."TD04_StrategyChecklist"
                SET "TD04_IsActive" = $1,
                    "TD04_IsRequired" = $2,
                    "TD04_ModifiedBy" = $3,
                    "TD04_ModifiedAt" = NOW()
                WHERE "TD03_Id" = $4 AND "TD02_Id" = $5
                RETURNING "TD03_Id", "TD02_Id", "TD04_IsActive", "TD04_IsRequired", "TD04_ModifiedAt"`,
                [body.isActive, body.isRequired, 'admin', body.strategyId, body.checklistId]
            );

            await client.query('COMMIT');

            const rowUpdated: IStrategyChecklistRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    strategyId: rowUpdated?.TD03_Id,
                    checklistId: rowUpdated?.TD02_Id,
                    isActive: rowUpdated?.TD04_IsActive,
                    isRequired: rowUpdated?.TD04_IsRequired,
                    modifiedAt: rowUpdated?.TD04_ModifiedAt,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateStrategyChecklistActiveStatus(body: UpdateStrategyChecklistActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "trading_setup"."TD04_StrategyChecklist"
                SET "TD04_IsActive" = $1,
                    "TD04_ModifiedBy" = $2,
                    "TD04_ModifiedAt" = NOW()
                WHERE "TD03_Id" = $3 AND "TD02_Id" = $4`,
            [body.isActive, 'admin', body.strategyId, body.checklistId]
        );
        return;
    }

    async deleteStrategyChecklist(strategyId: string, checklistId: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "trading_setup"."TD04_StrategyChecklist"
                WHERE "TD03_Id" = $1 AND "TD02_Id" = $2`,
            [strategyId, checklistId]
        );
        return;
    }
}
