export interface ITransactionRow {
    TS01_Id: string;
    TD05_Id: string;
    TS01_Amount: number;
    TS01_Fees: number;
    CM03_Value: string;
    TS01_CreatedBy: string;
    TS01_CreatedAt: Date;
    TS01_ModifiedBy: string;
    TS01_ModifiedAt: Date;
    TD05_Name?: string;
    CM03_Text?: string | null;
    CM03_ColorCode?: string | null;
}

export interface ITransaction {
    id: string;
    portfolioId: string;
    portfolioName?: string;
    amount: number;
    fees: number;
    resultValue: string;
    resultText?: string | null;
    resultColorCode?: string | null;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}
