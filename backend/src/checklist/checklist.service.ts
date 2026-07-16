import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IChecklist, IChecklistRow } from './checklist.interface';
import { CreateChecklistDto } from './dto/create-checklist.dto';
import { UpdateChecklistDto, UpdateChecklistActiveStatusDto } from './dto/update-checklist.dto';

@Injectable()
export class ChecklistService {
    constructor(private readonly pgService: PgService) {}

    async getAllChecklists() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "trading_setup"."TD02_Checklist" ORDER BY "TD02_CreatedAt"'
        );
        const rows: IChecklistRow[] = result.rows;
        const checklists: IChecklist[] = rows.map((r) => ({
            id: r.TD02_Id,
            name: r.TD02_Name,
            isRequired: r.TD02_IsRequired,
            isActive: r.TD02_IsActive,
            createdBy: r.TD02_CreatedBy,
            createdAt: r.TD02_CreatedAt,
            modifiedBy: r.TD02_ModifiedBy,
            modifiedAt: r.TD02_ModifiedAt,
        }))
        return {
            total: result.rowCount,
            data: checklists,
        };
    }

    async getChecklistById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "trading_setup"."TD02_Checklist" WHERE "TD02_Id" = $1',
            [id],
        );
        const rows: IChecklistRow[] = result.rows;
        if (rows.length === 0) throw new Error("Not found any checklist");

        const checklists: IChecklist[] = rows.map((r) => ({
            id: r.TD02_Id,
            name: r.TD02_Name,
            isRequired: r.TD02_IsRequired,
            isActive: r.TD02_IsActive,
            createdBy: r.TD02_CreatedBy,
            createdAt: r.TD02_CreatedAt,
            modifiedBy: r.TD02_ModifiedBy,
            modifiedAt: r.TD02_ModifiedAt,
        }))
        return {
            data: checklists[0],
        };
    }

    async createChecklist(body: CreateChecklistDto) {
        const pool = this.pgService.getPool();
        const authorName = "admin";

        const result = await pool.query(
            `INSERT INTO "trading_setup"."TD02_Checklist"
            ("TD02_Name", "TD02_CreatedBy", "TD02_ModifiedBy")
            VALUES ($1, $2, $3)
            RETURNING "TD02_Id"
            `
        , [body.name, authorName, authorName]);
        const rowInserted: IChecklistRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.TD02_Id,
            },
        };
    }

    async updateChecklistById(body: UpdateChecklistDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query("BEGIN");

        try {
            const result = await client.query(
                `UPDATE "trading_setup"."TD02_Checklist"
                SET "TD02_Name" = $1,
                    "TD02_IsRequired" = $2,
                    "TD02_IsActive" = $3,
                    "TD02_ModifiedBy" = $4,
                    "TD02_ModifiedAt" = NOW()
                    WHERE "TD02_Id" = $5
                RETURNING "TD02_Id", "TD02_Name", "TD02_IsRequired", "TD02_IsActive", "TD02_ModifiedAt"`,
                [body.name, body.isRequired, body.isActive, "admin", body.id]
            );

            await client.query("COMMIT");

            const rowUpdated: IChecklistRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.TD02_Id,
                    name: rowUpdated?.TD02_Name,
                    isRequired: rowUpdated?.TD02_IsRequired,
                    isActive: rowUpdated?.TD02_IsActive,
                    modifiedAt: rowUpdated?.TD02_ModifiedAt,
                }
            }
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    }

    async updateChecklistActiveStatusById(body: UpdateChecklistActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "trading_setup"."TD02_Checklist"
                SET "TD02_IsActive" = $1,
                    "TD02_ModifiedBy" = $2,
                    "TD02_ModifiedAt" = NOW()
                WHERE "TD02_Id" = $3
            `,
            [body.isActive, "admin", body.id],
        );
        return;
    }

    async deleteChecklistById(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "trading_setup"."TD02_Checklist"
                WHERE "TD02_Id" = $1`,
            [id]
        )
        return;
    }
}
