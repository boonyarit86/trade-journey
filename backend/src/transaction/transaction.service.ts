import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { ITransaction, ITransactionRow } from './transaction.interface';
import { CreateTransactionDto } from './dto/create-transaction.dto';

const TRANSACTION_SELECT = `
    SELECT
        t."TS01_Id", t."TD05_Id", t."TS01_Amount", t."TS01_Fees", t."CM03_Value",
        t."TS01_TradeDate", t."TS01_CreatedBy", t."TS01_CreatedAt", t."TS01_ModifiedBy", t."TS01_ModifiedAt",
        p."TD05_Name",
        cs."CM03_Text", cs."CM03_ColorCode"
    FROM "transaction"."TS01_Transaction" t
    INNER JOIN "trading_setup"."TD05_Portfolio" p ON t."TD05_Id" = p."TD05_Id"
    LEFT JOIN "common"."CM03_TransactionStatus" cs ON t."CM03_Value" = cs."CM03_Value"
`;

@Injectable()
export class TransactionService {
    constructor(private readonly pgService: PgService) {}

    private mapRow(r: ITransactionRow): ITransaction {
        return {
            id: r.TS01_Id,
            portfolioId: r.TD05_Id,
            portfolioName: r.TD05_Name,
            amount: Number(r.TS01_Amount),
            fees: Number(r.TS01_Fees),
            resultValue: r.CM03_Value,
            resultText: r.CM03_Text ?? null,
            resultColorCode: r.CM03_ColorCode ?? null,
            tradeDate: r.TS01_TradeDate,
            createdBy: r.TS01_CreatedBy,
            createdAt: r.TS01_CreatedAt,
            modifiedBy: r.TS01_ModifiedBy,
            modifiedAt: r.TS01_ModifiedAt,
        };
    }

    async getAllTransactions(portfolioId?: string) {
        const pool = this.pgService.getPool();
        const result = portfolioId
            ? await pool.query(
                  `${TRANSACTION_SELECT} WHERE t."TD05_Id" = $1 ORDER BY t."TS01_TradeDate", t."TS01_CreatedAt"`,
                  [portfolioId],
              )
            : await pool.query(`${TRANSACTION_SELECT} ORDER BY t."TS01_TradeDate", t."TS01_CreatedAt"`);
        const rows: ITransactionRow[] = result.rows;
        const transactions: ITransaction[] = rows.map((r) => this.mapRow(r));
        return {
            total: result.rowCount,
            data: transactions,
        };
    }

    async getTransactionById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `${TRANSACTION_SELECT} WHERE t."TS01_Id" = $1`,
            [id],
        );
        const rows: ITransactionRow[] = result.rows;
        if (rows.length === 0) throw new Error('Not found any transaction');
        return {
            data: this.mapRow(rows[0]),
        };
    }

    async createTransaction(body: CreateTransactionDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        const authorName = 'admin';
        const amount = body.amount;
        const fees = body.fees ?? 0;
        const resultValue = body.resultValue;
        const tradeDate = body.tradeDate ?? new Date().toISOString().split('T')[0];

        await client.query('BEGIN');
        try {
            const portfolioResult = await client.query(
                `SELECT
                    "TD05_Id", "TD05_CurrentBalance",
                    "TD05_TotalConsecutiveWin", "TD05_TotalConsecutiveLoss",
                    "TD05_SumTotalConsecutiveWin", "TD05_SumTotalConsecutiveLoss",
                    "TD05_MaxProfitAmount", "TD05_MaxLossAmount",
                    "TD05_TotalTrade", "TD05_TotalWinTrade", "TD05_TotalLossTrade",
                    "TD05_TotalBreakEven", "TD05_SumTotalBreakEven"
                FROM "trading_setup"."TD05_Portfolio"
                WHERE "TD05_Id" = $1
                FOR UPDATE`,
                [body.portfolioId],
            );
            if (portfolioResult.rows.length === 0) {
                throw new NotFoundException('Portfolio not found');
            }
            const p = portfolioResult.rows[0];

            let currentBalance = Number(p.TD05_CurrentBalance);
            let consecWin = Number(p.TD05_TotalConsecutiveWin);
            let consecLoss = Number(p.TD05_TotalConsecutiveLoss);
            let sumConsecWin = Number(p.TD05_SumTotalConsecutiveWin);
            let sumConsecLoss = Number(p.TD05_SumTotalConsecutiveLoss);
            let maxProfit = Number(p.TD05_MaxProfitAmount);
            let maxLoss = Number(p.TD05_MaxLossAmount);
            let totalTrade = Number(p.TD05_TotalTrade);
            let totalWin = Number(p.TD05_TotalWinTrade);
            let totalLoss = Number(p.TD05_TotalLossTrade);
            let totalBreakEven = Number(p.TD05_TotalBreakEven);
            let sumBreakEven = Number(p.TD05_SumTotalBreakEven);

            if (resultValue === 'W') {
                currentBalance += amount;
                consecWin += 1;
                consecLoss = 0;
                sumConsecWin = Math.max(sumConsecWin, consecWin);
                maxProfit = Math.max(maxProfit, amount);
                totalTrade += 1;
                totalWin += 1;
                totalBreakEven = 0;
            } else if (resultValue === 'L') {
                if (currentBalance < amount) {
                    throw new BadRequestException('Insufficient balance for this loss');
                }
                currentBalance -= amount;
                consecWin = 0;
                consecLoss += 1;
                sumConsecLoss = Math.max(sumConsecLoss, consecLoss);
                maxLoss = Math.max(maxLoss, amount);
                totalTrade += 1;
                totalLoss += 1;
                totalBreakEven = 0;
            } else {
                totalTrade += 1;
                totalBreakEven += 1;
                sumBreakEven = Math.max(sumBreakEven, totalBreakEven);
            }

            const winRate =
                totalWin + totalLoss === 0
                    ? 0
                    : Math.round((totalWin / (totalWin + totalLoss)) * 100);

            const insertResult = await client.query(
                `INSERT INTO "transaction"."TS01_Transaction"
                ("TD05_Id", "TS01_Amount", "TS01_Fees", "CM03_Value", "TS01_TradeDate", "TS01_CreatedBy", "TS01_ModifiedBy")
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING "TS01_Id"`,
                [body.portfolioId, amount, fees, resultValue, tradeDate, authorName, authorName],
            );
            const rowInserted: ITransactionRow = insertResult?.rows?.[0] ?? null;

            await client.query(
                `UPDATE "trading_setup"."TD05_Portfolio"
                SET "TD05_CurrentBalance" = $1,
                    "TD05_TotalConsecutiveWin" = $2,
                    "TD05_TotalConsecutiveLoss" = $3,
                    "TD05_SumTotalConsecutiveWin" = $4,
                    "TD05_SumTotalConsecutiveLoss" = $5,
                    "TD05_MaxProfitAmount" = $6,
                    "TD05_MaxLossAmount" = $7,
                    "TD05_TotalTrade" = $8,
                    "TD05_TotalWinTrade" = $9,
                    "TD05_TotalLossTrade" = $10,
                    "TD05_TotalBreakEven" = $11,
                    "TD05_SumTotalBreakEven" = $12,
                    "TD05_WinRatePercent" = $13,
                    "CM05_Value" = $14,
                    "TD05_ModifiedBy" = $15,
                    "TD05_ModifiedAt" = NOW()
                WHERE "TD05_Id" = $16`,
                [
                    currentBalance,
                    consecWin,
                    consecLoss,
                    sumConsecWin,
                    sumConsecLoss,
                    maxProfit,
                    maxLoss,
                    totalTrade,
                    totalWin,
                    totalLoss,
                    totalBreakEven,
                    sumBreakEven,
                    winRate,
                    resultValue,
                    authorName,
                    body.portfolioId,
                ],
            );

            await client.query('COMMIT');

            return {
                data: {
                    id: rowInserted?.TS01_Id,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}
