import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IStrategy, IStrategyChecklistItem, IStrategyRow } from './strategy.interface';
import { CreateStrategyDto } from './dto/create-strategy.dto';
import { UpdateStrategyActiveStatusDto, UpdateStrategyDto } from './dto/update-strategy.dto';

@Injectable()
export class StrategyService {
    constructor(private readonly pgService: PgService) {}

    private groupStrategyRows(rows: IStrategyRow[]): IStrategy[] {
        const map = new Map<string, IStrategy>();

        for (const r of rows) {
            if (!map.has(r.TD03_Id)) {
                map.set(r.TD03_Id, {
                    id: r.TD03_Id,
                    name: r.TD03_Name,
                    riskRewardRatio: r.TD03_RiskRewardRatio,
                    riskPerTrade: r.TD03_RiskPerTrade,
                    description: r.TD03_Description,
                    isActive: r.TD03_IsActive,
                    checklists: [],
                    createdBy: r.TD03_CreatedBy,
                    createdAt: r.TD03_CreatedAt,
                    modifiedBy: r.TD03_ModifiedBy,
                    modifiedAt: r.TD03_ModifiedAt,
                });
            }

            if (r.TD02_Id !== null) {
                const checklist: IStrategyChecklistItem = {
                    checklistId: r.TD02_Id,
                    isActive: r.TD04_IsActive!,
                    isRequired: r.TD04_IsRequired!,
                };
                map.get(r.TD03_Id)!.checklists.push(checklist);
            }
        }

        return Array.from(map.values());
    }

    async getAllStrategies() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT
                s."TD03_Id", s."TD03_Name", s."TD03_RiskRewardRatio", s."TD03_RiskPerTrade",
                s."TD03_Description", s."TD03_IsActive",
                s."TD03_CreatedBy", s."TD03_CreatedAt",
                s."TD03_ModifiedBy", s."TD03_ModifiedAt",
                sc."TD02_Id", sc."TD04_IsActive", sc."TD04_IsRequired"
            FROM "trading_setup"."TD03_Strategy" s
            LEFT JOIN "trading_setup"."TD04_StrategyChecklist" sc ON s."TD03_Id" = sc."TD03_Id"
            ORDER BY s."TD03_CreatedAt"`
        );
        const rows: IStrategyRow[] = result.rows;
        const strategies = this.groupStrategyRows(rows);
        return {
            total: strategies.length,
            data: strategies,
        };
    }

    async getStrategyById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT
                s."TD03_Id", s."TD03_Name", s."TD03_RiskRewardRatio", s."TD03_RiskPerTrade",
                s."TD03_Description", s."TD03_IsActive",
                s."TD03_CreatedBy", s."TD03_CreatedAt",
                s."TD03_ModifiedBy", s."TD03_ModifiedAt",
                sc."TD02_Id", sc."TD04_IsActive", sc."TD04_IsRequired"
            FROM "trading_setup"."TD03_Strategy" s
            LEFT JOIN "trading_setup"."TD04_StrategyChecklist" sc ON s."TD03_Id" = sc."TD03_Id"
            WHERE s."TD03_Id" = $1`,
            [id]
        );
        const rows: IStrategyRow[] = result.rows;
        if (rows.length === 0) throw new Error('Not found any strategy');

        const strategies = this.groupStrategyRows(rows);
        return {
            data: strategies[0],
        };
    }

    async createStrategy(body: CreateStrategyDto) {
        const pool = this.pgService.getPool();
        const authorName = 'admin';

        const result = await pool.query(
            `INSERT INTO "trading_setup"."TD03_Strategy"
            ("TD03_Name", "TD03_RiskRewardRatio", "TD03_RiskPerTrade", "TD03_Description", "TD03_CreatedBy", "TD03_ModifiedBy")
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING "TD03_Id"`,
            [body.name, body.riskRewardRatio ?? null, body.riskPerTrade ?? null, body.description ?? null, authorName, authorName]
        );
        const rowInserted: IStrategyRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.TD03_Id,
            },
        };
    }

    async updateStrategyById(body: UpdateStrategyDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            const result = await client.query(
                `UPDATE "trading_setup"."TD03_Strategy"
                SET "TD03_Name" = $1,
                    "TD03_RiskRewardRatio" = $2,
                    "TD03_RiskPerTrade" = $3,
                    "TD03_Description" = $4,
                    "TD03_IsActive" = $5,
                    "TD03_ModifiedBy" = $6,
                    "TD03_ModifiedAt" = NOW()
                WHERE "TD03_Id" = $7
                RETURNING "TD03_Id", "TD03_Name", "TD03_RiskRewardRatio", "TD03_RiskPerTrade", "TD03_Description", "TD03_IsActive", "TD03_ModifiedAt"`,
                [body.name, body.riskRewardRatio ?? null, body.riskPerTrade ?? null, body.description ?? null, body.isActive, 'admin', body.id]
            );

            await client.query('COMMIT');

            const rowUpdated: IStrategyRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.TD03_Id,
                    name: rowUpdated?.TD03_Name,
                    riskRewardRatio: rowUpdated?.TD03_RiskRewardRatio,
                    riskPerTrade: rowUpdated?.TD03_RiskPerTrade,
                    description: rowUpdated?.TD03_Description,
                    isActive: rowUpdated?.TD03_IsActive,
                    modifiedAt: rowUpdated?.TD03_ModifiedAt,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateStrategyActiveStatusById(body: UpdateStrategyActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "trading_setup"."TD03_Strategy"
                SET "TD03_IsActive" = $1,
                    "TD03_ModifiedBy" = $2,
                    "TD03_ModifiedAt" = NOW()
                WHERE "TD03_Id" = $3`,
            [body.isActive, 'admin', body.id]
        );
        return;
    }

    async deleteStrategyById(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "trading_setup"."TD03_Strategy"
                WHERE "TD03_Id" = $1`,
            [id]
        );
        return;
    }
}
