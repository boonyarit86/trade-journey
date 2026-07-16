import type { IChecklist } from "../types";

export const mockChecklists: IChecklist[] = [
    {
        id: "1",
        name: "Without emotional",
        isRequired: false,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-01"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-01"),
    },
    {
        id: "2",
        name: "Trading in specific time",
        isRequired: true,
        isActive: true,
        createdBy: "admin",
        createdAt: new Date("2026-01-02"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-02"),
    },
    {
        id: "3",
        name: "Not consecutive loss 2 times",
        isRequired: false,
        isActive: false,
        createdBy: "admin",
        createdAt: new Date("2026-01-03"),
        modifiedBy: "admin",
        modifiedAt: new Date("2026-01-03"),
    },
];
