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

export interface IAssetForm {
    id: string;
    name: string;
    assetTypeId: string;
    isActive: boolean;
}

export type AssetFormMode = "create" | "update";
