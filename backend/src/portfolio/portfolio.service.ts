import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IPortfolio, IPortfolioRow } from './portfolio.interface';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioActiveStatusDto, UpdatePortfolioDto } from './dto/update-portfolio.dto';

const PORTFOLIO_SELECT = `
    SELECT
        p."TD05_Id", p."TD01_Id", p."CM02_Id", p."TD03_Strategy",
        p."TD05_Name", p."TD05_InitBalance", p."TD05_CurrentBalance",
        p."TD05_TotalConsecutiveWin", p."TD05_TotalConsecutiveLoss",
        p."TD05_TotalConsecutiveWinDay", p."TD05_TotalConsecutiveLossDay",
        p."TD05_SumTotalConsecutiveWin", p."TD05_SumTotalConsecutiveLoss",
        p."TD05_SumTotalConsecutiveWinDay", p."TD05_SumTotalConsecutiveLossDay",
        p."TD05_MaxProfitAmount", p."TD05_MaxLossAmount", p."TD05_AverageRiskRewardRatio",
        p."TD05_TotalTrade", p."TD05_TotalWinTrade", p."TD05_TotalLossTrade", p."TD05_WinRatePercent",
        p."TD05_TotalBreakEven", p."TD05_SumTotalBreakEven", p."CM05_Value",
        p."TD05_Description", p."TD05_IsActive",
        p."TD05_CreatedBy", p."TD05_CreatedAt", p."TD05_ModifiedBy", p."TD05_ModifiedAt",
        proj."TD01_Name",
        a."CM02_Name", at."CM01_Name",
        s."TD03_Name"
    FROM "trading_setup"."TD05_Portfolio" p
    INNER JOIN "trading_setup"."TD01_Project" proj ON p."TD01_Id" = proj."TD01_Id"
    INNER JOIN "common"."CM02_Asset" a ON p."CM02_Id" = a."CM02_Id"
    LEFT JOIN "common"."CM01_AssetType" at ON a."CM01_Id" = at."CM01_Id"
    LEFT JOIN "trading_setup"."TD03_Strategy" s ON p."TD03_Strategy" = s."TD03_Id"
`;

@Injectable()
export class PortfolioService {
    constructor(private readonly pgService: PgService) {}

    private mapRowToPortfolio(r: IPortfolioRow): IPortfolio {
        return {
            id: r.TD05_Id,
            projectId: r.TD01_Id,
            projectName: r.TD01_Name,
            assetId: r.CM02_Id,
            assetName: r.CM02_Name,
            assetTypeName: r.CM01_Name,
            strategyId: r.TD03_Strategy,
            strategyName: r.TD03_Name ?? null,
            name: r.TD05_Name,
            initBalance: r.TD05_InitBalance,
            currentBalance: r.TD05_CurrentBalance,
            totalConsecutiveWin: r.TD05_TotalConsecutiveWin,
            totalConsecutiveLoss: r.TD05_TotalConsecutiveLoss,
            totalConsecutiveWinDay: r.TD05_TotalConsecutiveWinDay,
            totalConsecutiveLossDay: r.TD05_TotalConsecutiveLossDay,
            sumTotalConsecutiveWin: r.TD05_SumTotalConsecutiveWin,
            sumTotalConsecutiveLoss: r.TD05_SumTotalConsecutiveLoss,
            sumTotalConsecutiveWinDay: r.TD05_SumTotalConsecutiveWinDay,
            sumTotalConsecutiveLossDay: r.TD05_SumTotalConsecutiveLossDay,
            maxProfitAmount: r.TD05_MaxProfitAmount,
            maxLossAmount: r.TD05_MaxLossAmount,
            averageRiskRewardRatio: r.TD05_AverageRiskRewardRatio,
            totalTrade: r.TD05_TotalTrade,
            totalWinTrade: r.TD05_TotalWinTrade,
            totalLossTrade: r.TD05_TotalLossTrade,
            winRatePercent: r.TD05_WinRatePercent,
            totalBreakEven: r.TD05_TotalBreakEven,
            sumTotalBreakEven: r.TD05_SumTotalBreakEven,
            cm05Value: r.CM05_Value,
            description: r.TD05_Description,
            isActive: r.TD05_IsActive,
            createdBy: r.TD05_CreatedBy,
            createdAt: r.TD05_CreatedAt,
            modifiedBy: r.TD05_ModifiedBy,
            modifiedAt: r.TD05_ModifiedAt,
        };
    }

    async getAllPortfolios() {
        const pool = this.pgService.getPool();
        const result = await pool.query(`${PORTFOLIO_SELECT} ORDER BY p."TD05_CreatedAt"`);
        const rows: IPortfolioRow[] = result.rows;
        const portfolios: IPortfolio[] = rows.map((r) => this.mapRowToPortfolio(r));
        return {
            total: result.rowCount,
            data: portfolios,
        };
    }

    async getPortfolioById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `${PORTFOLIO_SELECT} WHERE p."TD05_Id" = $1`,
            [id],
        );
        const rows: IPortfolioRow[] = result.rows;
        if (rows.length === 0) throw new Error('Not found any portfolio');

        const portfolios: IPortfolio[] = rows.map((r) => this.mapRowToPortfolio(r));
        return {
            data: portfolios[0],
        };
    }

    private async assertProjectExists(pool: any, projectId: string) {
        const check = await pool.query(
            'SELECT "TD01_Id" FROM "trading_setup"."TD01_Project" WHERE "TD01_Id" = $1',
            [projectId],
        );
        if (check.rows.length === 0) throw new Error('Project not found');
    }

    private async assertAssetExists(pool: any, assetId: string) {
        const check = await pool.query(
            'SELECT "CM02_Id" FROM "common"."CM02_Asset" WHERE "CM02_Id" = $1',
            [assetId],
        );
        if (check.rows.length === 0) throw new Error('Asset not found');
    }

    private async assertStrategyExists(pool: any, strategyId: string) {
        const check = await pool.query(
            'SELECT "TD03_Id" FROM "trading_setup"."TD03_Strategy" WHERE "TD03_Id" = $1',
            [strategyId],
        );
        if (check.rows.length === 0) throw new Error('Strategy not found');
    }

    async createPortfolio(body: CreatePortfolioDto) {
        const pool = this.pgService.getPool();
        const authorName = 'admin';

        await this.assertProjectExists(pool, body.projectId);
        await this.assertAssetExists(pool, body.assetId);
        if (body.strategyId) {
            await this.assertStrategyExists(pool, body.strategyId);
        }

        const result = await pool.query(
            `INSERT INTO "trading_setup"."TD05_Portfolio"
            ("TD01_Id", "CM02_Id", "TD03_Strategy", "TD05_Name", "TD05_InitBalance", "TD05_CurrentBalance", "TD05_Description", "TD05_CreatedBy", "TD05_ModifiedBy")
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING "TD05_Id"`,
            [
                body.projectId,
                body.assetId,
                body.strategyId ?? null,
                body.name,
                body.initBalance,
                body.initBalance,
                body.description ?? null,
                authorName,
                authorName,
            ],
        );
        const rowInserted: IPortfolioRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.TD05_Id,
            },
        };
    }

    async updatePortfolioById(body: UpdatePortfolioDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            await this.assertProjectExists(client, body.projectId);
            await this.assertAssetExists(client, body.assetId);
            if (body.strategyId) {
                await this.assertStrategyExists(client, body.strategyId);
            }

            const result = await client.query(
                `UPDATE "trading_setup"."TD05_Portfolio"
                SET "TD01_Id" = $1,
                    "CM02_Id" = $2,
                    "TD03_Strategy" = $3,
                    "TD05_Name" = $4,
                    "TD05_InitBalance" = $5,
                    "TD05_Description" = $6,
                    "TD05_IsActive" = $7,
                    "TD05_ModifiedBy" = $8,
                    "TD05_ModifiedAt" = NOW()
                WHERE "TD05_Id" = $9
                RETURNING "TD05_Id", "TD05_Name", "TD05_InitBalance", "TD05_IsActive", "TD05_ModifiedAt"`,
                [
                    body.projectId,
                    body.assetId,
                    body.strategyId ?? null,
                    body.name,
                    body.initBalance,
                    body.description ?? null,
                    body.isActive,
                    'admin',
                    body.id,
                ],
            );

            await client.query('COMMIT');

            const rowUpdated: IPortfolioRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.TD05_Id,
                    name: rowUpdated?.TD05_Name,
                    initBalance: rowUpdated?.TD05_InitBalance,
                    isActive: rowUpdated?.TD05_IsActive,
                    modifiedAt: rowUpdated?.TD05_ModifiedAt,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updatePortfolioActiveStatusById(body: UpdatePortfolioActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "trading_setup"."TD05_Portfolio"
                SET "TD05_IsActive" = $1,
                    "TD05_ModifiedBy" = $2,
                    "TD05_ModifiedAt" = NOW()
                WHERE "TD05_Id" = $3`,
            [body.isActive, 'admin', body.id],
        );
        return;
    }

    async deletePortfolioById(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "trading_setup"."TD05_Portfolio"
                WHERE "TD05_Id" = $1`,
            [id],
        );
        return;
    }
}
