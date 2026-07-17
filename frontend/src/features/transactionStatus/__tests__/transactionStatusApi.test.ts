import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import {
    fetchTransactionStatuses,
    fetchTransactionStatusById,
    createTransactionStatus,
    updateTransactionStatus,
    updateTransactionStatusActiveStatus,
} from '../services/transactionStatusApi';
import { mockTransactionStatuses } from './mockData';

vi.mock('axios');

describe('transactionStatusApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchTransactionStatuses', () => {
        it('should fetch all transaction statuses', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockTransactionStatuses },
            });

            const result = await fetchTransactionStatuses();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/transaction-status'));
            expect(result).toEqual(mockTransactionStatuses);
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: {} });

            const result = await fetchTransactionStatuses();

            expect(result).toEqual([]);
        });
    });

    describe('fetchTransactionStatusById', () => {
        it('should fetch a single transaction status by id', async () => {
            const mockStatus = mockTransactionStatuses[0];
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockStatus },
            });

            const result = await fetchTransactionStatusById('1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/transaction-status/1'));
            expect(result).toEqual(mockStatus);
        });
    });

    describe('createTransactionStatus', () => {
        it('should create a new transaction status and return id', async () => {
            const newData = { text: 'win', value: 'W', colorCode: '#52c41a' };
            const mockId = 'new-uuid';
            vi.mocked(Axios.post).mockResolvedValue({
                data: { data: { id: mockId } },
            });

            const result = await createTransactionStatus(newData);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/transaction-status'),
                newData,
            );
            expect(result).toBe(mockId);
        });
    });

    describe('updateTransactionStatus', () => {
        it('should update a transaction status', async () => {
            const updateData = {
                id: '1',
                text: 'win-updated',
                value: 'W',
                colorCode: '#52c41a',
                isActive: true,
            };
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateTransactionStatus(updateData);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/transaction-status'),
                updateData,
            );
        });
    });

    describe('updateTransactionStatusActiveStatus', () => {
        it('should update active status', async () => {
            const id = '1';
            const isActive = false;
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateTransactionStatusActiveStatus(id, isActive);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/transaction-status/activeStatus'),
                { id, isActive },
            );
        });
    });
});
