import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import { fetchTransactions, fetchTransactionById, createTransaction } from '../services/transactionApi';
import { mockTransactions } from './mockData';

vi.mock('axios');

describe('transactionApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchTransactions', () => {
        it('should fetch all transactions', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: { data: mockTransactions } });

            const result = await fetchTransactions();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/transaction'));
            expect(result).toEqual(mockTransactions);
        });

        it('should fetch transactions filtered by portfolioId', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: { data: mockTransactions } });

            await fetchTransactions('port-1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/transaction?portfolioId=port-1'));
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: {} });

            const result = await fetchTransactions();

            expect(result).toEqual([]);
        });
    });

    describe('fetchTransactionById', () => {
        it('should fetch a single transaction by id', async () => {
            vi.mocked(Axios.get).mockResolvedValue({ data: { data: mockTransactions[0] } });

            const result = await fetchTransactionById('tx-1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/transaction/tx-1'));
            expect(result).toEqual(mockTransactions[0]);
        });
    });

    describe('createTransaction', () => {
        it('should create a transaction and return its id', async () => {
            const newTransaction = { portfolioId: 'port-1', amount: 150, fees: 5, resultValue: 'W' as const };
            vi.mocked(Axios.post).mockResolvedValue({ data: { data: { id: 'new-tx-id' } } });

            const result = await createTransaction(newTransaction);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/transaction'),
                newTransaction,
            );
            expect(result).toBe('new-tx-id');
        });
    });
});
