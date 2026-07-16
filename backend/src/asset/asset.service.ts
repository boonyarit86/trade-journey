import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IAssetType, IAssetTypeRow, IAsset, IAssetRow } from './asset.interface';
import { CreateAssetTypeDto } from './dto/create-asset.dto';
import { UpdateAssetTypeActiveStatusDto, UpdateAssetTypeDto } from './dto/update-asset.dto';
import { CreateAssetItemDto } from './dto/create-asset-item.dto';
import { UpdateAssetItemDto, UpdateAssetItemActiveStatusDto } from './dto/update-asset-item.dto';

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

    async getAllAssets() {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT 
                a."CM02_Id", a."CM01_Id", a."CM02_Name", a."CM02_IsActive", 
                a."CM02_CreatedBy", a."CM02_CreatedAt", 
                a."CM02_ModifiedBy", a."CM02_ModifiedAt",
                t."CM01_Name"
            FROM "common"."CM02_Asset" a
            LEFT JOIN "common"."CM01_AssetType" t ON a."CM01_Id" = t."CM01_Id"
            ORDER BY a."CM02_CreatedAt"`
        );
        const rows: IAssetRow[] = result.rows;
        const assets: IAsset[] = rows.map((r) => ({
            id: r.CM02_Id,
            assetTypeId: r.CM01_Id,
            assetTypeName: r.CM01_Name,
            name: r.CM02_Name,
            isActive: r.CM02_IsActive,
            createdBy: r.CM02_CreatedBy,
            createdAt: r.CM02_CreatedAt,
            modifiedBy: r.CM02_ModifiedBy,
            modifiedAt: r.CM02_ModifiedAt,
        }))
        return {
            total: result.rowCount,
            data: assets,
        };
    };

    async getAssetById(id: string) {
        const pool = this.pgService.getPool();
        const result = await pool.query(
            `SELECT 
                a."CM02_Id", a."CM01_Id", a."CM02_Name", a."CM02_IsActive", 
                a."CM02_CreatedBy", a."CM02_CreatedAt", 
                a."CM02_ModifiedBy", a."CM02_ModifiedAt",
                t."CM01_Name"
            FROM "common"."CM02_Asset" a
            LEFT JOIN "common"."CM01_AssetType" t ON a."CM01_Id" = t."CM01_Id"
            WHERE a."CM02_Id" = $1`,
            [id],
        );
        const rows: IAssetRow[] = result.rows;
        if (rows.length === 0) throw new Error("Not found any asset");

        const assets: IAsset[] = rows.map((r) => ({
            id: r.CM02_Id,
            assetTypeId: r.CM01_Id,
            assetTypeName: r.CM01_Name,
            name: r.CM02_Name,
            isActive: r.CM02_IsActive,
            createdBy: r.CM02_CreatedBy,
            createdAt: r.CM02_CreatedAt,
            modifiedBy: r.CM02_ModifiedBy,
            modifiedAt: r.CM02_ModifiedAt,
        }))
        return {
            data: assets[0],
        };
    };

    async createAsset(body: CreateAssetItemDto) {
        const pool = this.pgService.getPool();
        const authorName = "admin";

        const assetTypeCheck = await pool.query(
            'SELECT "CM01_Id" FROM "common"."CM01_AssetType" WHERE "CM01_Id" = $1',
            [body.assetTypeId]
        );
        if (assetTypeCheck.rows.length === 0) {
            throw new Error("Asset type not found");
        }

        const result = await pool.query(
            `INSERT INTO "common"."CM02_Asset"
            ("CM01_Id", "CM02_Name", "CM02_CreatedBy", "CM02_ModifiedBy")
            VALUES ($1, $2, $3, $4)
            RETURNING "CM02_Id"
            `
        , [body.assetTypeId, body.name, authorName, authorName]);
        const rowInserted: IAssetRow = result?.rows?.[0] ?? null;

        return {
            data: {
                id: rowInserted?.CM02_Id,
            },
        };
    };

    async updateAssetById(body: UpdateAssetItemDto) {
        const pool = this.pgService.getPool();
        const client = await pool.connect();
        await client.query("BEGIN");

        try {
            const assetTypeCheck = await client.query(
                'SELECT "CM01_Id" FROM "common"."CM01_AssetType" WHERE "CM01_Id" = $1',
                [body.assetTypeId]
            );
            if (assetTypeCheck.rows.length === 0) {
                throw new Error("Asset type not found");
            }

            const result = await client.query(
                `UPDATE "common"."CM02_Asset"
                SET "CM02_Name" = $1,
                    "CM01_Id" = $2,
                    "CM02_IsActive" = $3,
                    "CM02_ModifiedBy" = $4,
                    "CM02_ModifiedAt" = NOW()
                    WHERE "CM02_Id" = $5
                RETURNING "CM02_Id", "CM02_Name", "CM02_IsActive", "CM02_ModifiedAt"`,
                [body.name, body.assetTypeId, body.isActive, "admin", body.id]
            );

            await client.query("COMMIT");

            const rowUpdated: IAssetRow = result?.rows?.[0] ?? null;
            return {
                data: {
                    id: rowUpdated?.CM02_Id,
                    name: rowUpdated?.CM02_Name,
                    isActive: rowUpdated?.CM02_IsActive,
                    modifiedAt: rowUpdated?.CM02_ModifiedAt,
                }
            }
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    };

    async updateAssetActiveStatusById(body: UpdateAssetItemActiveStatusDto) {
        const pool = this.pgService.getPool();
        await pool.query(
            `UPDATE "common"."CM02_Asset"
                SET "CM02_IsActive" = $1,
                    "CM02_ModifiedBy" = $2,
                    "CM02_ModifiedAt" = NOW()
                WHERE "CM02_Id" = $3
            `,
            [body.isActive, "admin", body.id],
        );
        return;
    };

    async deleteAssetById(id: string) {
        const pool = this.pgService.getPool();
        await pool.query(
            `DELETE FROM "common"."CM02_Asset"
                WHERE "CM02_Id" = $1`,
            [id]
        )
        return;
    };
};
