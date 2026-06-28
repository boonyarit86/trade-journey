import { Injectable } from '@nestjs/common';
import { PgService } from 'src/database/pg.service';
import { IAssetType, IAssetTypeRow } from './asset.interface';

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
}
