export interface IStrategyRow {
    TD03_Id: string;
    TD03_Name: string;
    TD03_RiskRewardRatio: number | null;
    TD03_RiskPerTrade: number | null;
    TD03_Description: string | null;
    TD03_IsActive: boolean;
    TD03_CreatedBy: string;
    TD03_CreatedAt: Date;
    TD03_ModifiedBy: string;
    TD03_ModifiedAt: Date;
    TD02_Id: string | null;
    TD04_IsActive: boolean | null;
    TD04_IsRequired: boolean | null;
}

export interface IStrategyChecklistItem {
    checklistId: string;
    isActive: boolean;
    isRequired: boolean;
}

export interface IStrategy {
    id: string;
    name: string;
    riskRewardRatio: number | null;
    riskPerTrade: number | null;
    description: string | null;
    isActive: boolean;
    checklists: IStrategyChecklistItem[];
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}
