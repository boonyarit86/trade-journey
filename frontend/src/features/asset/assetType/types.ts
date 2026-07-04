export interface IAssetType {
    id: string;
    name: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}

export interface IAssetTypeForm {
    id: string;
    name: string;
    isActive: boolean;
}

export type AssetTypeFromMode = "create" | "update";