import type { IStrategy } from "../types";
import type { IChecklist } from "../../checklist/types";

export const mockChecklists: IChecklist[] = [
    {
        id: "cl-1",
        name: "Without emotional",
        isRequired: false,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
    {
        id: "cl-2",
        name: "Trading in specific time",
        isRequired: true,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-02"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-02"),
    },
];

export const mockStrategies: IStrategy[] = [
    {
        id: "st-1",
        name: "Breakout",
        riskRewardRatio: 2,
        riskPerTrade: 1,
        description: "Breakout strategy",
        isActive: true,
        checklists: [
            { checklistId: "cl-1", isActive: true, isRequired: false },
            { checklistId: "cl-2", isActive: true, isRequired: true },
        ],
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
    {
        id: "st-2",
        name: "Trend Following",
        riskRewardRatio: 3,
        riskPerTrade: 2,
        description: "Follow the trend",
        isActive: false,
        checklists: [],
        createdBy: "admin",
        createdAt: new Date("2026-01-02"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-02"),
    },
];
