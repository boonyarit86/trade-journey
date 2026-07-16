import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import {
    fetchAssets,
    fetchAssetById,
    createAsset,
    updateAssetById,
    updateAssetActiveStatusById,
    deleteAssetById,
} from '../services/assetItemApi';
import { mockAssets } from './mockData';

vi.mock('axios');

describe('assetItemApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchAssets', () => {
        it('should fetch all assets', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockAssets },
            });

            const result = await fetchAssets();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/asset'));
            expect(result).toEqual(mockAssets);
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: {},
            });

            const result = await fetchAssets();

            expect(result).toEqual([]);
        });
    });

    describe('fetchAssetById', () => {
        it('should fetch a single asset by id', async () => {
            const mockAsset = mockAssets[0];
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockAsset },
            });

            const result = await fetchAssetById('1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/asset/1'));
            expect(result).toEqual(mockAsset);
        });
    });

    describe('createAsset', () => {
        it('should create a new asset', async () => {
            const newAssetData = { name: 'BTCUSD', assetTypeId: 'asset-type-1' };
            const mockId = 'new-asset-id';
            vi.mocked(Axios.post).mockResolvedValue({
                data: { data: { id: mockId } },
            });

            const result = await createAsset(newAssetData);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/asset'),
                newAssetData
            );
            expect(result).toEqual(mockId);
        });
    });

    describe('updateAssetById', () => {
        it('should update an asset', async () => {
            const updateData = {
                id: '1',
                name: 'XAUUSD_UPDATED',
                assetTypeId: 'asset-type-1',
                isActive: true,
            };
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateAssetById(updateData);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/asset'),
                updateData
            );
        });
    });

    describe('updateAssetActiveStatusById', () => {
        it('should update asset active status', async () => {
            const id = '1';
            const isActive = false;
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateAssetActiveStatusById(id, isActive);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/asset/activeStatus'),
                { id, isActive }
            );
        });
    });

    describe('deleteAssetById', () => {
        it('should delete an asset', async () => {
            const id = '1';
            vi.mocked(Axios.delete).mockResolvedValue({ data: {} });

            await deleteAssetById(id);

            expect(Axios.delete).toHaveBeenCalledWith(
                expect.stringContaining(`/asset/${id}`)
            );
        });
    });
});
