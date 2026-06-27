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