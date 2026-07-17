import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TransactionStatusScreen } from '../index';
import * as transactionStatusApi from '../services/transactionStatusApi';
import { mockTransactionStatuses } from './mockData';

vi.mock('../services/transactionStatusApi');

describe('TransactionStatusScreen', () => {
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
    });

    afterEach(async () => {
        cleanup();
        queryClient.clear();
        await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const renderComponent = () =>
        render(
            <QueryClientProvider client={queryClient}>
                <TransactionStatusScreen />
            </QueryClientProvider>,
        );

    it('should render the screen title', async () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockResolvedValue(
            mockTransactionStatuses,
        );

        renderComponent();

        expect(screen.getByText('Trade Result')).toBeDefined();
    });

    it('should display a loading table', () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockImplementation(
            () => new Promise(() => {}),
        );

        renderComponent();

        expect(screen.getByRole('table')).toBeDefined();
    });

    it('should display transaction statuses in the table', async () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockResolvedValue(
            mockTransactionStatuses,
        );

        renderComponent();

        await waitFor(() => {
            expect(screen.getAllByText('win').length).toBeGreaterThan(0);
            expect(screen.getAllByText('loss').length).toBeGreaterThan(0);
        });
    });

    it('should open modal when clicking New Status button', async () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockResolvedValue(
            mockTransactionStatuses,
        );

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('New Status')).toBeTruthy();
        });

        const newButton = screen.getByText('New Status');
        await user.click(newButton);

        await waitFor(() => {
            const modals = screen.getAllByText('Trade Result');
            expect(modals.length).toBeGreaterThan(1);
        });
    });

    it('should display error state when fetch fails', async () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockRejectedValue(
            new Error('Failed to fetch'),
        );

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });

    it('should call updateTransactionStatusActiveStatus when toggling switch', async () => {
        vi.mocked(transactionStatusApi.fetchTransactionStatuses).mockResolvedValue(
            mockTransactionStatuses,
        );
        vi.mocked(transactionStatusApi.updateTransactionStatusActiveStatus).mockResolvedValue(
            undefined,
        );

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getAllByText('win').length).toBeGreaterThan(0);
        });

        const switches = screen.getAllByRole('switch');
        await user.click(switches[0]);

        await waitFor(() => {
            expect(transactionStatusApi.updateTransactionStatusActiveStatus).toHaveBeenCalled();
        });
    });
});
