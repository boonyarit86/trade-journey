import type { ITransaction } from "../transaction/types";

export const signedAmount = (transaction: ITransaction): number => {
    if (transaction.resultValue === "W") return transaction.amount;
    if (transaction.resultValue === "L") return -transaction.amount;
    return 0;
};

const sortByTradeDate = (transactions: ITransaction[]): ITransaction[] =>
    [...transactions].sort((a, b) => {
        const dateCompare = a.tradeDate.localeCompare(b.tradeDate);
        if (dateCompare !== 0) return dateCompare;
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

export interface BalancePoint {
    label: string;
    balance: number;
}

export const buildBalanceSeries = (
    initBalance: number,
    transactions: ITransaction[],
): BalancePoint[] => {
    const sorted = sortByTradeDate(transactions);
    const points: BalancePoint[] = [{ label: "Start", balance: initBalance }];
    let running = initBalance;
    sorted.forEach((t, index) => {
        running += signedAmount(t);
        points.push({ label: `#${index + 1}`, balance: running });
    });
    return points;
};

export interface DrawdownPoint {
    label: string;
    drawdown: number;
}

export const buildDrawdownSeries = (
    initBalance: number,
    transactions: ITransaction[],
): DrawdownPoint[] => {
    const series = buildBalanceSeries(initBalance, transactions);
    let peak = series.length > 0 ? series[0].balance : initBalance;
    return series.map((point) => {
        peak = Math.max(peak, point.balance);
        const drawdown = peak === 0 ? 0 : ((point.balance - peak) / peak) * 100;
        return { label: point.label, drawdown: Number(drawdown.toFixed(2)) };
    });
};

export const toDateKey = (value: string): string => {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const buildDailyPnl = (transactions: ITransaction[]): Record<string, number> => {
    return transactions.reduce<Record<string, number>>((acc, t) => {
        const key = t.tradeDate;
        acc[key] = (acc[key] ?? 0) + signedAmount(t);
        return acc;
    }, {});
};

export const computeProfitLoss = (
    initBalance: number,
    currentBalance: number,
): { amount: number; percent: number } => {
    const amount = currentBalance - initBalance;
    const percent = initBalance === 0 ? 0 : (amount / initBalance) * 100;
    return { amount, percent };
};
