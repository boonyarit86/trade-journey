import type { IAsset } from "../types";

export const mockAssets: IAsset[] = [
    {
        id: "1",
        assetTypeId: "asset-type-1",
        assetTypeName: "Gold",
        name: "XAUUSD",
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
    {
        id: "2",
        assetTypeId: "asset-type-2",
        assetTypeName: "Forex",
        name: "EURUSD",
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-02"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-02"),
    },
    {
        id: "3",
        assetTypeId: "asset-type-1",
        assetTypeName: "Gold",
        name: "XAGUSD",
        isActive: false,
        createdBy: "admin",
        createdAt: new Date("2026-01-03"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-03"),
    },
];

export const mockAssetTypes = [
    { id: "asset-type-1", name: "Gold", isActive: true },
    { id: "asset-type-2", name: "Forex", isActive: true },
    { id: "asset-type-3", name: "Stocks", isActive: true },
];
