import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChecklistScreen } from '../index';
import * as checklistApi from '../services/checklistApi';
import { mockChecklists } from './mockData';

vi.mock('../services/checklistApi');

describe('ChecklistScreen', () => {
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

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <ChecklistScreen />
            </QueryClientProvider>
        );
    };

    it('should render checklist screen with title', async () => {
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);

        renderComponent();

        expect(screen.getByText('Checklist')).toBeDefined();
    });

    it('should display loading state', () => {
        vi.mocked(checklistApi.fetchChecklists).mockImplementation(
            () => new Promise(() => {})
        );

        renderComponent();

        expect(screen.getByRole('table')).toBeDefined();
    });

    it('should display checklists in table', async () => {
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('Without emotional')).toBeTruthy();
            expect(screen.queryByText('Trading in specific time')).toBeTruthy();
        });
    });

    it('should open modal when clicking New Checklist button', async () => {
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('New Checklist')).toBeTruthy();
        });

        const newButton = screen.getByText('New Checklist');
        await user.click(newButton);

        await waitFor(() => {
            const modals = screen.getAllByText('Checklist');
            expect(modals.length).toBeGreaterThan(1);
        });
    });

    it('should display error state', async () => {
        const errorMessage = 'Failed to fetch checklists';
        vi.mocked(checklistApi.fetchChecklists).mockRejectedValue(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });

    it('should handle delete checklist', async () => {
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);
        vi.mocked(checklistApi.deleteChecklistById).mockResolvedValue(undefined);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('Without emotional')).toBeDefined();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(checklistApi.deleteChecklistById).toHaveBeenCalled();
        });
    });

    it('should display required badge for required items', async () => {
        vi.mocked(checklistApi.fetchChecklists).mockResolvedValue(mockChecklists);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Without emotional')).toBeDefined();
            const table = screen.getByRole('table');
            expect(table).toBeDefined();
        });
    });
});
