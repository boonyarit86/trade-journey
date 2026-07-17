export interface ITransactionStatus {
    id: string;
    text: string;
    value: string;
    colorCode: string;
    isActive: boolean;
    createdBy: string;
    createdAt: string;
    modifiedBy: string;
    modifiedAt: string;
}

export interface ITransactionStatusForm {
    id?: string;
    text: string;
    value: string;
    colorCode: string;
    isActive?: boolean;
}

export type TransactionStatusFormMode = 'create' | 'update';
