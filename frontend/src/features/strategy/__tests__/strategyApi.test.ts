import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import {
    fetchStrategies,
    fetchStrategyById,
    createStrategy,
    updateStrategyById,
    updateStrategyActiveStatusById,
    deleteStrategyById,
} from '../services/strategyApi';
import { createStrategyChecklist, deleteStrategyChecklist, updateStrategyChecklistItem } from '../services/strategyChecklistApi';
import { mockStrategies } from './mockData';

vi.mock('axios');

describe('strategyApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchStrategies', () => {
        it('should fetch all strategies', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockStrategies },
            });

            const result = await fetchStrategies();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/strategy'));
            expect(result).toEqual(mockStrategies);
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: {} });

            const result = await fetchStrategies();

            expect(result).toEqual([]);
        });
    });

    describe('fetchStrategyById', () => {
        it('should fetch a single strategy by id', async () => {
            const mockStrategy = mockStrategies[0];
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockStrategy },
            });

            const result = await fetchStrategyById('st-1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/strategy/st-1'));
            expect(result).toEqual(mockStrategy);
        });
    });

    describe('createStrategy', () => {
        it('should create a new strategy and return its id', async () => {
            const newStrategyData = { name: 'Breakout', riskRewardRatio: 2, riskPerTrade: 1 };
            vi.mocked(Axios.post).mockResolvedValue({
                data: { data: { id: 'new-strategy-id' } },
            });

            const result = await createStrategy(newStrategyData);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/strategy'),
                newStrategyData
            );
            expect(result).toBe('new-strategy-id');
        });
    });

    describe('updateStrategyById', () => {
        it('should update a strategy', async () => {
            const updateData = {
                id: 'st-1',
                name: 'Updated Breakout',
                riskRewardRatio: 3,
                riskPerTrade: 2,
                isActive: true,
                checklists: [{ checklistId: 'cl-1', isRequired: false, isActive: true }],
            };
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateStrategyById(updateData);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/strategy'),
                updateData
            );
        });
    });

    describe('updateStrategyActiveStatusById', () => {
        it('should update strategy active status', async () => {
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateStrategyActiveStatusById('st-1', false);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/strategy/activeStatus'),
                { id: 'st-1', isActive: false }
            );
        });
    });

    describe('deleteStrategyById', () => {
        it('should delete a strategy', async () => {
            vi.mocked(Axios.delete).mockResolvedValue({ data: {} });

            await deleteStrategyById('st-1');

            expect(Axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/strategy/st-1')
            );
        });
    });
});

describe('strategyChecklistApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createStrategyChecklist', () => {
        it('should create a link with isRequired and isActive', async () => {
            vi.mocked(Axios.post).mockResolvedValue({ data: {} });

            await createStrategyChecklist('st-1', 'cl-1', true, false);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/strategy-checklist'),
                { strategyId: 'st-1', checklistId: 'cl-1', isRequired: true, isActive: false }
            );
        });

        it('should omit isRequired and isActive when not provided', async () => {
            vi.mocked(Axios.post).mockResolvedValue({ data: {} });

            await createStrategyChecklist('st-1', 'cl-1');

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/strategy-checklist'),
                { strategyId: 'st-1', checklistId: 'cl-1' }
            );
        });
    });

    describe('updateStrategyChecklistItem', () => {
        it('should update isRequired and isActive for an existing link', async () => {
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateStrategyChecklistItem('st-1', 'cl-1', true, false);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/strategy-checklist'),
                { strategyId: 'st-1', checklistId: 'cl-1', isRequired: true, isActive: false }
            );
        });
    });

    describe('deleteStrategyChecklist', () => {
        it('should delete a strategy-checklist link', async () => {
            vi.mocked(Axios.delete).mockResolvedValue({ data: {} });

            await deleteStrategyChecklist('st-1', 'cl-1');

            expect(Axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/strategy-checklist/st-1/cl-1')
            );
        });
    });
});
