export interface IAssetTypeRow {
    CM01_Id: string;
    CM01_Name: string;
    CM01_IsActive: boolean;
    CM01_CreatedBy: string;
    CM01_CreatedAt: Date;
    CM01_ModifiedBy: string;
    CM01_ModifiedAt: Date;
}

export interface IAssetType {
    id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}

export interface IAssetRow {
    CM02_Id: string;
    CM01_Id: string;
    CM02_Name: string;
    CM02_IsActive: boolean;
    CM02_CreatedBy: string;
    CM02_CreatedAt: Date;
    CM02_ModifiedBy: string;
    CM02_ModifiedAt: Date;
    CM01_Name?: string;
}

export interface IAsset {
    id: string;
    assetTypeId: string;
    assetTypeName?: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}