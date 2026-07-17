import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import {
    fetchPortfolios,
    fetchPortfolioById,
    createPortfolio,
    updatePortfolioById,
    updatePortfolioActiveStatusById,
    deletePortfolioById,
} from '../services/portfolioApi';
import { mockPortfolios } from './mockData';

vi.mock('axios');

describe('portfolioApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchPortfolios', () => {
        it('should fetch all portfolios', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockPortfolios },
            });

            const result = await fetchPortfolios();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/portfolio'));
            expect(result).toEqual(mockPortfolios);
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: {} });

            const result = await fetchPortfolios();

            expect(result).toEqual([]);
        });
    });

    describe('fetchPortfolioById', () => {
        it('should fetch a single portfolio by id', async () => {
            const mockPortfolio = mockPortfolios[0];
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockPortfolio },
            });

            const result = await fetchPortfolioById('port-1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/portfolio/port-1'));
            expect(result).toEqual(mockPortfolio);
        });
    });

    describe('createPortfolio', () => {
        it('should create a new portfolio and return its id', async () => {
            const newPortfolioData = {
                name: 'Main Portfolio',
                projectId: 'proj-1',
                assetId: 'asset-1',
                strategyId: 'st-1',
                initBalance: 1000,
                description: 'desc',
            };
            vi.mocked(Axios.post).mockResolvedValue({
                data: { data: { id: 'new-portfolio-id' } },
            });

            const result = await createPortfolio(newPortfolioData);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/portfolio'),
                newPortfolioData
            );
            expect(result).toBe('new-portfolio-id');
        });
    });

    describe('updatePortfolioById', () => {
        it('should update a portfolio', async () => {
            const updateData = {
                id: 'port-1',
                name: 'Updated Portfolio',
                projectId: 'proj-1',
                assetId: 'asset-1',
                strategyId: 'st-1',
                initBalance: 2000,
                description: 'updated',
                isActive: true,
            };
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updatePortfolioById(updateData);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/portfolio'),
                updateData
            );
        });
    });

    describe('updatePortfolioActiveStatusById', () => {
        it('should update portfolio active status', async () => {
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updatePortfolioActiveStatusById('port-1', false);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/portfolio/activeStatus'),
                { id: 'port-1', isActive: false }
            );
        });
    });

    describe('deletePortfolioById', () => {
        it('should delete a portfolio', async () => {
            vi.mocked(Axios.delete).mockResolvedValue({ data: {} });

            await deletePortfolioById('port-1');

            expect(Axios.delete).toHaveBeenCalledWith(
                expect.stringContaining('/portfolio/port-1')
            );
        });
    });
});
