export interface IProjectRow {
    TD01_Id: string;
    TD01_Name: string;
    TD01_IsDefault: boolean;
    TD01_IsActive: boolean;
    TD01_CreatedBy: string;
    TD01_CreatedAt: Date;
    TD01_ModifiedBy: string;
    TD01_ModifiedAt: Date;
}

export interface IProject {
    id: string;
    name: string;
    isDefault: boolean;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}

export interface IProjectForm extends IProject{}