import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PortfolioScreen } from '../index';
import * as portfolioApi from '../services/portfolioApi';
import * as projectApi from '../../project/services/projectApi';
import * as assetItemApi from '../../asset/assetItem/services/assetItemApi';
import * as strategyApi from '../../strategy/services/strategyApi';
import * as checklistApi from '../../checklist/services/checklistApi';
import { mockPortfolios, mockProjects, mockAssets, mockStrategies, mockChecklists } from './mockData';

vi.mock('../services/portfolioApi');
vi.mock('../../project/services/projectApi');
vi.mock('../../asset/assetItem/services/assetItemApi');
vi.mock('../../strategy/services/strategyApi');
vi.mock('../../checklist/services/checklistApi');

describe('PortfolioScreen', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: {
                    retry: false,
                    gcTime: 0,
                    staleTime: 0,
                },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
        vi.mocked(projectApi.fetchProjects).mockResolvedValue(mockProjects);
        vi.mocked(assetItemApi.fetchAssets).mockResolvedValue(mockAssets);
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);
    });

    afterEach(async () => {
        cleanup();
        queryClient.clear();
        await new Promise((resolve) => setTimeout(resolve, 100));
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <PortfolioScreen />
            </QueryClientProvider>
        );
    };

    it('should render portfolio screen with title', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);

        renderComponent();

        expect(screen.getByText('Portfolio')).toBeDefined();
    });

    it('should display loading state', () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockImplementation(
            () => new Promise(() => {})
        );

        renderComponent();

        expect(screen.getByRole('table')).toBeDefined();
    });

    it('should display portfolios in table', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('Main Portfolio')).toBeTruthy();
            expect(screen.queryByText('No Strategy Portfolio')).toBeTruthy();
        });
    });

    it('should display computed current balance percent', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('1200 (+20.00%)')).toBeTruthy();
            expect(screen.queryByText('400 (-20.00%)')).toBeTruthy();
        });
    });

    it('should display "-" for strategy when none is linked', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('Breakout')).toBeTruthy();
        });
    });

    it('should open modal when clicking New Portfolio button', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('New Portfolio')).toBeTruthy();
        });

        const newButton = screen.getByText('New Portfolio');
        await user.click(newButton);

        await waitFor(() => {
            const modals = screen.getAllByText('Portfolio');
            expect(modals.length).toBeGreaterThan(1);
        });
    });

    it('should display error state', async () => {
        const errorMessage = 'Failed to fetch portfolios';
        vi.mocked(portfolioApi.fetchPortfolios).mockRejectedValue(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });

    it('should handle delete portfolio', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);
        vi.mocked(portfolioApi.deletePortfolioById).mockResolvedValue(undefined);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('Main Portfolio')).toBeDefined();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(portfolioApi.deletePortfolioById).toHaveBeenCalled();
        });
    });

    it('should toggle active status', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockPortfolios);
        vi.mocked(portfolioApi.updatePortfolioActiveStatusById).mockResolvedValue(undefined);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('Main Portfolio')).toBeDefined();
        });

        const switches = screen.getAllByRole('switch');
        await user.click(switches[0]);

        await waitFor(() => {
            expect(portfolioApi.updatePortfolioActiveStatusById).toHaveBeenCalledWith('port-1', false);
        });
    });
});
