export interface IPortfolio {
    id: string;
    projectId: string;
    projectName?: string;
    assetId: string;
    assetName?: string;
    assetTypeName?: string;
    strategyId: string | null;
    strategyName?: string | null;
    name: string;
    initBalance: number;
    currentBalance: number;
    totalConsecutiveWin: number;
    totalConsecutiveLoss: number;
    totalConsecutiveWinDay: number;
    totalConsecutiveLossDay: number;
    sumTotalConsecutiveWin: number;
    sumTotalConsecutiveLoss: number;
    sumTotalConsecutiveWinDay: number;
    sumTotalConsecutiveLossDay: number;
    maxProfitAmount: number;
    maxLossAmount: number;
    averageRiskRewardRatio: number;
    totalTrade: number;
    totalWinTrade: number;
    totalLossTrade: number;
    winRatePercent: number;
    totalBreakEven?: number;
    sumTotalBreakEven?: number;
    cm05Value?: string | null;
    description: string | null;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    modifiedBy: string;
    modifiedAt: Date;
}

export interface IPortfolioForm {
    id: string;
    name: string;
    projectId: string;
    assetId: string;
    strategyId?: string;
    initBalance: number;
    description?: string;
    isActive: boolean;
}

export type PortfolioFormMode = "create" | "update";
