import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AssetItemScreen } from '../index';
import * as assetItemApi from '../services/assetItemApi';
import * as assetTypeApi from '../../assetType/services/assetTypeApi';
import { mockAssets, mockAssetTypes } from './mockData';

vi.mock('../services/assetItemApi');
vi.mock('../../assetType/services/assetTypeApi');

describe('AssetItemScreen', () => {
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
                <AssetItemScreen />
            </QueryClientProvider>
        );
    };

    it('should render asset item screen with title', async () => {
        vi.mocked(assetItemApi.fetchAssets).mockResolvedValue(mockAssets);

        renderComponent();

        expect(screen.getByText('Asset Item')).toBeDefined();
    });

    it('should display loading state', () => {
        vi.mocked(assetItemApi.fetchAssets).mockImplementation(
            () => new Promise(() => {})
        );

        renderComponent();

        expect(screen.getByRole('table')).toBeDefined();
    });

    it('should display assets in table', async () => {
        vi.mocked(assetItemApi.fetchAssets).mockResolvedValue(mockAssets);

        renderComponent();

        await waitFor(() => {
            expect(screen.queryByText('XAUUSD')).toBeTruthy();
            expect(screen.queryByText('EURUSD')).toBeTruthy();
        });
    });

    it('should open modal when clicking New Asset button', async () => {
        vi.mocked(assetItemApi.fetchAssets).mockResolvedValue(mockAssets);
        vi.mocked(assetTypeApi.fetchAssetTypes).mockResolvedValue(mockAssetTypes);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.queryByText('New Asset')).toBeTruthy();
        });

        const newButton = screen.getByText('New Asset');
        await user.click(newButton);

        await waitFor(() => {
            const modals = screen.getAllByText('Asset Item');
            expect(modals.length).toBeGreaterThan(1);
        });
    });

    it('should display error state', async () => {
        const errorMessage = 'Failed to fetch assets';
        vi.mocked(assetItemApi.fetchAssets).mockRejectedValue(new Error(errorMessage));

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Error')).toBeDefined();
        });
    });

    it('should handle delete asset', async () => {
        vi.mocked(assetItemApi.fetchAssets).mockResolvedValue(mockAssets);
        vi.mocked(assetItemApi.deleteAssetById).mockResolvedValue(undefined);

        renderComponent();
        const user = userEvent.setup();

        await waitFor(() => {
            expect(screen.getByText('XAUUSD')).toBeDefined();
        });

        const deleteButtons = screen.getAllByText('Delete');
        await user.click(deleteButtons[0]);

        await waitFor(() => {
            expect(assetItemApi.deleteAssetById).toHaveBeenCalled();
        });
    });
});
