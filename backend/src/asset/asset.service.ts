import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IAssetType, IAssetTypeRow } from './asset.interface';
import { CreateAssetTypeDto } from './dto/create-asset.dto';
import { UpdateAssetTypeActiveStatusDto, UpdateAssetTypeDto } from './dto/update-asset.dto';

@Injectable()
export class AssetService {
    constructor(private readonly pgService: PgService) {}

    async getAllAssetTypes() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "common"."CM01_AssetType" ORDER BY "CM01_CreatedAt"'
        );
        const rows: IAssetTypeRow[] = result.rows;
        const assetTypes: IAssetType[] = rows.map((r) => ({
            id: r.CM01_Id,
            name: r.CM01_Name,
            isActive: r.CM01_IsActive,
            createdBy: r.CM01_CreatedBy,
            createdAt: r.CM01_CreatedAt,
            modifiedBy: r.CM01_ModifiedBy,
            modifiedAt: r.CM01_ModifiedAt,
        }))
        return {
            total: result.rowCount,
            data: assetTypes,
        };
    };

    async getAssetTypeById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            'SELECT * from "common"."CM01_AssetType" WHERE "CM01_Id" = $1',
            [id],
        );
        const rows: IAssetTypeRow[] = result.rows;
        if (rows.length === 0) throw new Error("Not found any asset type");

        const assetTypes: IAssetType[] = rows.map((r) => ({
            id: r.CM01_Id,
            name: r.CM01_Name,
            isActive: r.CM01_IsActive,
            createdBy: r.CM01_CreatedBy,
            createdAt: r.CM01_CreatedAt,
            modifiedBy: r.CM01_ModifiedBy,
            modifiedAt: r.CM01_ModifiedAt,
        }))
        return {
            data: assetTypes[0],
        };
    };

    async createAssetType(body: CreateAssetTypeDto) {
        const pool = this.pgService.getPool();
        const authorName = "admin";

        const result = await pool.query(
            `INSERT INTO "common"."CM01_AssetType"
            ("CM01_Name", "CM01_CreatedBy", "CM01_ModifiedBy")
            VALUES ($1, $2, $3)
            RETURNING "CM01_Id"
            `
        , [body.name, authorName, authorName]);
        const rowInserted: IAssetTypeRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.CM01_Id,
            },
        };
    };

    async updateAssetTypeById(body: UpdateAssetTypeDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query("BEGIN");

        try {
            const result = await client.query(
                `UPDATE "common"."CM01_AssetType"
                SET "CM01_Name" = $1,
                    "CM01_IsActive" = $2,
                    "CM01_ModifiedAt" = NOW()
                    WHERE "CM01_Id" = $3
                RETURNING "CM01_Id", "CM01_Name", "CM01_IsActive", "CM01_ModifiedAt"`,
                [body.name, body.isActive, body.id]
            );

            await client.query("COMMIT");

            const rowUpdated: IAssetTypeRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.CM01_Id,
                    name: rowUpdated?.CM01_Name,
                    isActive: rowUpdated?.CM01_IsActive,
                    modifiedAt: rowUpdated?.CM01_ModifiedAt,
                }
            }
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    async updateAssetTypeActiveStatusById(body: UpdateAssetTypeActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "common"."CM01_AssetType"
                SET "CM01_IsActive" = $1,
                    "CM01_ModifiedAt" = NOW()
                WHERE "CM01_Id" = $2
            `,
            [body.isActive, body.id],
        );
        return;
    };

    async deleteAssetTypeById(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "common"."CM01_AssetType"
                WHERE "CM01_Id" = $1`,
            [id]
        )
        return;
    };
};
