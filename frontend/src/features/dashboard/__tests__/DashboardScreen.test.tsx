import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DashboardScreen } from '../index';
import * as projectApi from '../../project/services/projectApi';
import * as portfolioApi from '../../portfolio/services/portfolioApi';
import * as transactionApi from '../../transaction/services/transactionApi';
import * as strategyApi from '../../strategy/services/strategyApi';
import * as checklistApi from '../../checklist/services/checklistApi';
import {
    mockDashboardProjects,
    mockDashboardPortfolios,
    mockDashboardStrategies,
    mockDashboardChecklists,
    mockTransactions,
} from '../../transaction/__tests__/mockData';

vi.mock('../../project/services/projectApi');
vi.mock('../../portfolio/services/portfolioApi');
vi.mock('../../transaction/services/transactionApi');
vi.mock('../../strategy/services/strategyApi');
vi.mock('../../checklist/services/checklistApi');

describe('DashboardScreen', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false, gcTime: 0, staleTime: 0 },
                mutations: { retry: false },
            },
        });
        vi.clearAllMocks();
        vi.mocked(projectApi.fetchProjects).mockResolvedValue(mockDashboardProjects);
        vi.mocked(portfolioApi.fetchPortfolios).mockResolvedValue(mockDashboardPortfolios);
        vi.mocked(transactionApi.fetchTransactions).mockResolvedValue(mockTransactions);
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockDashboardStrategies);
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockDashboardChecklists);
    });

    afterEach(async () => {
        cleanup();
        queryClient.clear();
        await new Promise((resolve) => setTimeout(resolve, 50));
    });

    const renderComponent = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <DashboardScreen />
            </QueryClientProvider>,
        );

    const selectPortfolio = async (user: ReturnType<typeof userEvent.setup>) => {
        const comboboxes = screen.getAllByRole('combobox');
        await user.click(comboboxes[1]);
        const option = await screen.findByText('Main Portfolio (Forex Journey)');
        await user.click(option);
    };

    it('should render the dashboard title and empty prompt', async () => {
        renderComponent();

        expect(screen.getByText('Dashboard')).toBeDefined();
        await waitFor(() => {
            expect(screen.getByText('Select a portfolio to view its trading summary')).toBeDefined();
        });
    });

    it('should disable New Transaction button until a portfolio is selected', async () => {
        renderComponent();

        const button = screen.getByRole('button', { name: 'New Transaction' });
        expect(button).toHaveProperty('disabled', true);
    });

    it('should show summary and transactions after selecting a portfolio', async () => {
        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
        });

        await selectPortfolio(user);

        await waitFor(() => {
            expect(screen.getByText('Current Balance')).toBeDefined();
            expect(screen.getByText('Win Rate')).toBeDefined();
        });

        await waitFor(() => {
            expect(screen.getByText('win')).toBeDefined();
            expect(screen.getByText('loss')).toBeDefined();
        });
    });

    it('should gate the transaction form submit on required checklist', async () => {
        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getAllByRole('combobox').length).toBeGreaterThanOrEqual(2);
        });
        await selectPortfolio(user);

        const newButton = screen.getByRole('button', { name: 'New Transaction' });
        await waitFor(() => expect(newButton).toHaveProperty('disabled', false));
        await user.click(newButton);

        const saveButton = await screen.findByRole('button', { name: 'Save' });
        expect(saveButton).toHaveProperty('disabled', true);

        const checkbox = await screen.findByText('Confirm trend (Required)');
        await user.click(checkbox);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: 'Save' })).toHaveProperty('disabled', false);
        });
    });

    it('should show error state when portfolios fail to load', async () => {
        vi.mocked(portfolioApi.fetchPortfolios).mockRejectedValue(new Error('failed'));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });
});
