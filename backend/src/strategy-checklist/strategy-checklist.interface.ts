export interface IStrategyChecklistRow {
    TD02_Id: string;
    TD03_Id: string;
    TD04_IsActive: boolean;
    TD04_IsRequired: boolean;
    TD04_CreatedBy: string;
    TD04_CreatedAt: Date;
    TD04_ModifiedBy: string;
    TD04_ModifiedAt: Date;
}

export interface IStrategyChecklist {
    checklistId: string;
    strategyId: string;
    isActive: boolean;
    isRequired: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}
