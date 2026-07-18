export type TransactionResultValue = "W" | "L" | "B";

export interface ITransaction {
    id: string;
    portfolioId: string;
    portfolioName?: string;
    amount: number;
    fees: number;
    resultValue: string;
    resultText?: string | null;
    resultColorCode?: string | null;
    tradeDate: string;
    createdBy: string;
    createdAt: string;
    modifiedBy: string;
    modifiedAt: string;
}

export interface ITransactionForm {
    portfolioId: string;
    amount: number;
    fees?: number;
    resultValue: TransactionResultValue;
    tradeDate?: string;
}
