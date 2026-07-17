import { describe, it, expect } from 'vitest';
import {
    signedAmount,
    buildBalanceSeries,
    buildDrawdownSeries,
    buildDailyPnl,
    toDateKey,
    computeProfitLoss,
} from '../utils';
import type { ITransaction } from '../../transaction/types';

const makeTx = (overrides: Partial<ITransaction>): ITransaction => ({
    id: 'tx',
    portfolioId: 'port-1',
    amount: 100,
    fees: 0,
    resultValue: 'W',
    createdBy: 'admin',
    createdAt: '2026-01-01T00:00:00.000Z',
    modifiedBy: 'admin',
    modifiedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
});

describe('dashboard utils', () => {
    describe('signedAmount', () => {
        it('should be positive for win, negative for loss, zero for break-even', () => {
            expect(signedAmount(makeTx({ resultValue: 'W', amount: 100 }))).toBe(100);
            expect(signedAmount(makeTx({ resultValue: 'L', amount: 100 }))).toBe(-100);
            expect(signedAmount(makeTx({ resultValue: 'B', amount: 0 }))).toBe(0);
        });
    });

    describe('buildBalanceSeries', () => {
        it('should build a running balance starting from init balance', () => {
            const transactions = [
                makeTx({ id: 'a', resultValue: 'W', amount: 200, createdAt: '2026-01-02T00:00:00.000Z' }),
                makeTx({ id: 'b', resultValue: 'L', amount: 100, createdAt: '2026-01-03T00:00:00.000Z' }),
            ];

            const series = buildBalanceSeries(1000, transactions);

            expect(series).toEqual([
                { label: 'Start', balance: 1000 },
                { label: '#1', balance: 1200 },
                { label: '#2', balance: 1100 },
            ]);
        });

        it('should sort transactions by date before computing', () => {
            const transactions = [
                makeTx({ id: 'b', resultValue: 'L', amount: 100, createdAt: '2026-01-03T00:00:00.000Z' }),
                makeTx({ id: 'a', resultValue: 'W', amount: 200, createdAt: '2026-01-02T00:00:00.000Z' }),
            ];

            const series = buildBalanceSeries(1000, transactions);

            expect(series[1].balance).toBe(1200);
            expect(series[2].balance).toBe(1100);
        });
    });

    describe('buildDrawdownSeries', () => {
        it('should compute drawdown percentage from running peak', () => {
            const transactions = [
                makeTx({ id: 'a', resultValue: 'W', amount: 200, createdAt: '2026-01-02T00:00:00.000Z' }),
                makeTx({ id: 'b', resultValue: 'L', amount: 300, createdAt: '2026-01-03T00:00:00.000Z' }),
            ];

            const series = buildDrawdownSeries(1000, transactions);

            expect(series[0].drawdown).toBe(0);
            expect(series[1].drawdown).toBe(0);
            expect(series[2].drawdown).toBe(-25);
        });
    });

    describe('buildDailyPnl', () => {
        it('should aggregate net pnl per day', () => {
            const dayOne = '2026-01-02T09:00:00.000Z';
            const dayTwo = '2026-01-03T10:00:00.000Z';
            const transactions = [
                makeTx({ id: 'a', resultValue: 'W', amount: 200, createdAt: dayOne }),
                makeTx({ id: 'b', resultValue: 'L', amount: 50, createdAt: dayOne }),
                makeTx({ id: 'c', resultValue: 'W', amount: 30, createdAt: dayTwo }),
            ];

            const result = buildDailyPnl(transactions);

            expect(result[toDateKey(dayOne)]).toBe(150);
            expect(result[toDateKey(dayTwo)]).toBe(30);
        });
    });

    describe('computeProfitLoss', () => {
        it('should compute amount and percent difference', () => {
            expect(computeProfitLoss(1000, 1200)).toEqual({ amount: 200, percent: 20 });
            expect(computeProfitLoss(1000, 800)).toEqual({ amount: -200, percent: -20 });
        });

        it('should avoid division by zero', () => {
            expect(computeProfitLoss(0, 100)).toEqual({ amount: 100, percent: 0 });
        });
    });
});
