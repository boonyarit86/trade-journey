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

export interface IStrategyFormChecklistItem {
    checklistId: string;
    isRequired: boolean;
    isActive: boolean;
}

export interface IStrategyForm {
    id: string;
    name: string;
    riskRewardRatio?: number;
    riskPerTrade?: number;
    description?: string;
    isActive: boolean;
    checklists: IStrategyFormChecklistItem[];
}

export type StrategyFormMode = "create" | "update";
