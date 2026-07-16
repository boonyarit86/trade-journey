export interface IChecklist {
    id: string;
    name: string;
    isRequired: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}

export interface IChecklistForm {
    id: string;
    name: string;
    isRequired: boolean;
    isActive: boolean;
}

export type ChecklistFormMode = "create" | "update";
