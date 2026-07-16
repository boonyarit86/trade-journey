export interface IChecklistRow {
    TD02_Id: string;
    TD02_Name: string;
    TD02_IsRequired: boolean;
    TD02_IsActive: boolean;
    TD02_CreatedBy: string;
    TD02_CreatedAt: Date;
    TD02_ModifiedBy: string;
    TD02_ModifiedAt: Date;
}

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
