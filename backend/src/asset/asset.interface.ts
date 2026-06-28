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