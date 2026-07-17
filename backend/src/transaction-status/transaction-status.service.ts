import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { ITransactionStatus, ITransactionStatusRow } from './transaction-status.interface';
import { CreateTransactionStatusDto } from './dto/create-transaction-status.dto';
import { UpdateTransactionStatusDto } from './dto/update-transaction-status.dto';
import { UpdateTransactionStatusActiveStatusDto } from './dto/update-active-status.dto';

@Injectable()
export class TransactionStatusService {
    constructor(private readonly pgService: PgService) {}

    async getAllTransactionStatuses() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * FROM "common"."CM03_TransactionStatus" ORDER BY "CM03_CreatedAt"'
        );
        const rows: ITransactionStatusRow[] = result.rows;
        const statuses: ITransactionStatus[] = rows.map((r) => this.mapRow(r));
        return {
            total: result.rowCount,
            data: statuses,
        };
    }

    async getTransactionStatusById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * FROM "common"."CM03_TransactionStatus" WHERE "CM03_Id" = $1',
            [id]
        );
        const rows: ITransactionStatusRow[] = result.rows;
        if (rows.length === 0) throw new Error('Not found any transaction status');
        return {
            data: this.mapRow(rows[0]),
        };
    }

    async createTransactionStatus(body: CreateTransactionStatusDto) {
        const pool = this.pgService.getPool();
        const authorName = 'admin';
        const result = await pool.query(
            `INSERT INTO "common"."CM03_TransactionStatus"
            ("CM03_Text", "CM03_Value", "CM03_ColorCode", "CM03_CreatedBy", "CM03_ModifiedBy")
            VALUES ($1, $2, $3, $4, $5)
            RETURNING "CM03_Id"`,
            [body.text, body.value, body.colorCode, authorName, authorName]
        );
        const rowInserted: ITransactionStatusRow = result?.rows?.[0] ?? null;
        return {
            data: {
                id: rowInserted?.CM03_Id,
            },
        };
    }

    async updateTransactionStatusById(body: UpdateTransactionStatusDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query('BEGIN');

        try {
            const result = await client.query(
                `UPDATE "common"."CM03_TransactionStatus"
                SET "CM03_Text"      = $1,
                    "CM03_Value"     = $2,
                    "CM03_ColorCode" = $3,
                    "CM03_IsActive"  = $4,
                    "CM03_ModifiedBy" = $5,
                    "CM03_ModifiedAt" = NOW()
                WHERE "CM03_Id" = $6
                RETURNING "CM03_Id", "CM03_Text", "CM03_Value", "CM03_ColorCode", "CM03_IsActive", "CM03_ModifiedAt"`,
                [body.text, body.value, body.colorCode, body.isActive, 'admin', body.id]
            );

            await client.query('COMMIT');

            const rowUpdated: ITransactionStatusRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.CM03_Id,
                    text: rowUpdated?.CM03_Text,
                    value: rowUpdated?.CM03_Value,
                    colorCode: rowUpdated?.CM03_ColorCode,
                    isActive: rowUpdated?.CM03_IsActive,
                    modifiedAt: rowUpdated?.CM03_ModifiedAt,
                },
            };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async updateTransactionStatusActiveStatusById(body: UpdateTransactionStatusActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "common"."CM03_TransactionStatus"
                SET "CM03_IsActive"   = $1,
                    "CM03_ModifiedBy" = $2,
                    "CM03_ModifiedAt" = NOW()
            WHERE "CM03_Id" = $3`,
            [body.isActive, 'admin', body.id]
        );
        return;
    }

    private mapRow(r: ITransactionStatusRow): ITransactionStatus {
        return {
            id: r.CM03_Id,
            text: r.CM03_Text,
            value: r.CM03_Value,
            colorCode: r.CM03_ColorCode,
            isActive: r.CM03_IsActive,
            createdBy: r.CM03_CreatedBy,
            createdAt: r.CM03_CreatedAt,
            modifiedBy: r.CM03_ModifiedBy,
            modifiedAt: r.CM03_ModifiedAt,
        };
    }
}
