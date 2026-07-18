import type { ITransaction } from "../types";
import type { IPortfolio } from "../../portfolio/types";
import type { IProject } from "../../project/types";
import type { IStrategy } from "../../strategy/types";
import type { IChecklist } from "../../checklist/types";

export const mockDashboardProjects: IProject[] = [
    {
        id: "proj-1",
        name: "Forex Journey",
        isDefault: true,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
];

export const mockDashboardChecklists: IChecklist[] = [
    {
        id: "cl-1",
        name: "Confirm trend",
        isRequired: true,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
];

export const mockDashboardStrategies: IStrategy[] = [
    {
        id: "st-1",
        name: "Breakout",
        riskRewardRatio: 2,
        riskPerTrade: 1,
        description: "Breakout strategy",
        isActive: true,
        checklists: [{ checklistId: "cl-1", isActive: true, isRequired: true }],
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
];

export const mockDashboardPortfolios: IPortfolio[] = [
    {
        id: "port-1",
        projectId: "proj-1",
        projectName: "Forex Journey",
        assetId: "asset-1",
        assetName: "XAUUSD",
        assetTypeName: "Gold",
        strategyId: "st-1",
        strategyName: "Breakout",
        name: "Main Portfolio",
        initBalance: 1000,
        currentBalance: 1200,
        totalConsecutiveWin: 3,
        totalConsecutiveLoss: 0,
        totalConsecutiveWinDay: 0,
        totalConsecutiveLossDay: 0,
        sumTotalConsecutiveWin: 3,
        sumTotalConsecutiveLoss: 0,
        sumTotalConsecutiveWinDay: 0,
        sumTotalConsecutiveLossDay: 0,
        maxProfitAmount: 300,
        maxLossAmount: 100,
        averageRiskRewardRatio: 2,
        totalTrade: 10,
        totalWinTrade: 7,
        totalLossTrade: 3,
        winRatePercent: 70,
        totalBreakEven: 0,
        sumTotalBreakEven: 0,
        cm05Value: "W",
        description: "My main trading portfolio",
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
];

export const mockTransactions: ITransaction[] = [
    {
        id: "tx-1",
        portfolioId: "port-1",
        portfolioName: "Main Portfolio",
        amount: 200,
        fees: 10,
        resultValue: "W",
        resultText: "win",
        resultColorCode: "#52c41a",
        tradeDate: "2026-01-02",
        createdBy: "admin",
        createdAt: "2026-01-02T10:00:00.000Z",
        modifiedBy: "admin",
        modifiedAt: "2026-01-02T10:00:00.000Z",
    },
    {
        id: "tx-2",
        portfolioId: "port-1",
        portfolioName: "Main Portfolio",
        amount: 100,
        fees: 0,
        resultValue: "L",
        resultText: "loss",
        resultColorCode: "#ff4d4f",
        tradeDate: "2026-01-03",
        createdBy: "admin",
        createdAt: "2026-01-03T10:00:00.000Z",
        modifiedBy: "admin",
        modifiedAt: "2026-01-03T10:00:00.000Z",
    },
];
