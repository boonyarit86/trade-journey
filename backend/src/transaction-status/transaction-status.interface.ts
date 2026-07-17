export interface ITransactionStatusRow {
    CM03_Id: string;
    CM03_Text: string;
    CM03_Value: string;
    CM03_ColorCode: string;
    CM03_IsActive: boolean;
    CM03_CreatedBy: string;
    CM03_CreatedAt: Date;
    CM03_ModifiedBy: string;
    CM03_ModifiedAt: Date;
}

export interface ITransactionStatus {
    id: string;
    text: string;
    value: string;
    colorCode: string;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}
