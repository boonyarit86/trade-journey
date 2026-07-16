import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrategyScreen } from '../index';
import * as strategyApi from '../services/strategyApi';
import * as checklistApi from '../../checklist/services/checklistApi';
import { mockStrategies, mockChecklists } from './mockData';

vi.mock('../services/strategyApi');
vi.mock('../services/strategyChecklistApi');
vi.mock('../../checklist/services/checklistApi');

describe('StrategyScreen', () => {
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
                <StrategyScreen />
            </QueryClientProvider>
        );
    };

    it('should render strategy screen with title', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);

        renderComponent();

        expect(screen.getByText('Strategy')).toBeDefined();
    });

    it('should display loading state', () => {
        vi.mocked(strategyApi.fetchStrategies).mockImplementation(
            () => new Promise(() => {})
        );

        renderComponent();

        expect(screen.getByRole('table')).toBeDefined();
    });

    it('should display strategies in table', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('Breakout')).toBeTruthy();
            expect(screen.queryByText('Trend Following')).toBeTruthy();
        });
    });

    it('should display checklist count tag for strategies with checklists', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('2 items')).toBeTruthy();
        });
    });

    it('should display None badge for strategies with no checklists', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('None')).toBeTruthy();
        });
    });

    it('should open modal when clicking New Strategy button', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('New Strategy')).toBeTruthy();
        });

        const newButton = screen.getByText('New Strategy');
        await user.click(newButton);

        await waitFor(() => {
            const modals = screen.getAllByText('Strategy');
            expect(modals.length).toBeGreaterThan(1);
        });
    });

    it('should display error state', async () => {
        const errorMessage = 'Failed to fetch strategies';
        vi.mocked(strategyApi.fetchStrategies).mockRejectedValue(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });

    it('should handle delete strategy', async () => {
        vi.mocked(strategyApi.fetchStrategies).mockResolvedValue(mockStrategies);
        vi.mocked(strategyApi.deleteStrategyById).mockResolvedValue(undefined);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('Breakout')).toBeDefined();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(strategyApi.deleteStrategyById).toHaveBeenCalled();
        });
    });
});
