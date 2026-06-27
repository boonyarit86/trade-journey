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

export interface IProjectForm {
    id: string;
    name: string;
    isActive: boolean;
}

export type ProjectFromMode = "create" | "update";