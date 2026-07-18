import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
    let service: TransactionService;
    let mockQuery: jest.Mock;
    let mockClient: any;

    const buildTransactionRow = (overrides: Partial<Record<string, unknown>> = {}) => {
        const now = new Date();
        return {
            TS01_Id: 'transaction-1',
            TD05_Id: 'portfolio-1',
            TS01_Amount: 100,
            TS01_Fees: 5,
            CM03_Value: 'W',
            TS01_TradeDate: '2026-01-01',
            TS01_CreatedBy: 'admin',
            TS01_CreatedAt: now,
            TS01_ModifiedBy: 'admin',
            TS01_ModifiedAt: now,
            TD05_Name: 'Main Portfolio',
            CM03_Text: 'win',
            CM03_ColorCode: '#0f0',
            ...overrides,
        };
    };

    const buildPortfolioRow = (overrides: Partial<Record<string, unknown>> = {}) => ({
        TD05_Id: 'portfolio-1',
        TD05_CurrentBalance: 1000,
        TD05_TotalConsecutiveWin: 0,
        TD05_TotalConsecutiveLoss: 0,
        TD05_SumTotalConsecutiveWin: 0,
        TD05_SumTotalConsecutiveLoss: 0,
        TD05_MaxProfitAmount: 0,
        TD05_MaxLossAmount: 0,
        TD05_TotalTrade: 0,
        TD05_TotalWinTrade: 0,
        TD05_TotalLossTrade: 0,
        TD05_TotalBreakEven: 0,
        TD05_SumTotalBreakEven: 0,
        ...overrides,
    });

    beforeEach(async () => {
        mockQuery = jest.fn();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TransactionService,
                {
                    provide: PgService,
                    useValue: {
                        getPool: jest.fn().mockReturnValue({
                            query: mockQuery,
                            connect: jest.fn().mockResolvedValue(mockClient),
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<TransactionService>(TransactionService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllTransactions', () => {
        it('should return all transactions with joined portfolio and status data', async () => {
            mockQuery.mockResolvedValue({ rows: [buildTransactionRow()], rowCount: 1 });

            const result = await service.getAllTransactions();

            expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].portfolioName).toBe('Main Portfolio');
            expect(result.data[0].resultValue).toBe('W');
            expect(result.data[0].resultText).toBe('win');
            expect(result.data[0].resultColorCode).toBe('#0f0');
            expect(result.data[0].tradeDate).toBe('2026-01-01');
            expect(mockQuery.mock.calls[0][1]).toBeUndefined();
        });

        it('should filter by portfolioId when provided', async () => {
            mockQuery.mockResolvedValue({ rows: [buildTransactionRow()], rowCount: 1 });

            await service.getAllTransactions('portfolio-1');

            expect(mockQuery.mock.calls[0][1]).toEqual(['portfolio-1']);
        });
    });

    describe('getTransactionById', () => {
        it('should return a single transaction by id', async () => {
            mockQuery.mockResolvedValue({ rows: [buildTransactionRow()] });

            const result = await service.getTransactionById('transaction-1');

            expect(result.data.id).toBe('transaction-1');
            expect(result.data.amount).toBe(100);
            expect(result.data.fees).toBe(5);
        });

        it('should throw error if transaction not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(service.getTransactionById('not-exist')).rejects.toThrow('Not found any transaction');
        });
    });

    describe('createTransaction', () => {
        const runCreate = (portfolioRow: any, dto: any) => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [portfolioRow] }) // SELECT portfolio FOR UPDATE
                .mockResolvedValueOnce({ rows: [{ TS01_Id: 'transaction-1' }] }) // INSERT
                .mockResolvedValueOnce(undefined) // UPDATE portfolio
                .mockResolvedValueOnce(undefined); // COMMIT
            return service.createTransaction(dto);
        };

        const getPortfolioUpdateParams = () => mockClient.query.mock.calls[3][1];

        it('should apply a win: increase balance, streak, win count, and win rate', async () => {
            const result = await runCreate(
                buildPortfolioRow({ TD05_TotalConsecutiveWin: 2, TD05_TotalLossTrade: 1, TD05_TotalWinTrade: 1 }),
                { portfolioId: 'portfolio-1', amount: 150, fees: 10, resultValue: 'W' },
            );

            expect(result.data.id).toBe('transaction-1');
            const params = getPortfolioUpdateParams();
            expect(params[0]).toBe(1150); // currentBalance 1000 + 150
            expect(params[1]).toBe(3); // consecWin 2 + 1
            expect(params[2]).toBe(0); // consecLoss reset
            expect(params[3]).toBe(3); // sumConsecWin max
            expect(params[5]).toBe(150); // maxProfit
            expect(params[7]).toBe(1); // totalTrade
            expect(params[8]).toBe(2); // totalWin 1 + 1
            expect(params[10]).toBe(0); // totalBreakEven reset
            expect(params[12]).toBe(67); // winRate round(2/3*100)
            expect(params[13]).toBe('W'); // CM05_Value
        });

        it('should apply a loss: decrease balance, loss streak, and reset win streak', async () => {
            const result = await runCreate(
                buildPortfolioRow({ TD05_CurrentBalance: 500, TD05_TotalConsecutiveLoss: 1, TD05_TotalWinTrade: 3, TD05_TotalLossTrade: 6 }),
                { portfolioId: 'portfolio-1', amount: 200, resultValue: 'L' },
            );

            expect(result.data.id).toBe('transaction-1');
            const params = getPortfolioUpdateParams();
            expect(params[0]).toBe(300); // balance 500 - 200
            expect(params[1]).toBe(0); // consecWin reset
            expect(params[2]).toBe(2); // consecLoss 1 + 1
            expect(params[4]).toBe(2); // sumConsecLoss max
            expect(params[6]).toBe(200); // maxLoss
            expect(params[9]).toBe(7); // totalLoss 6 + 1
            expect(params[12]).toBe(30); // winRate round(3/10*100)
            expect(params[13]).toBe('L');
        });

        it('should apply a break-even: increase trade and break-even counters only', async () => {
            const result = await runCreate(
                buildPortfolioRow({ TD05_TotalBreakEven: 2, TD05_SumTotalBreakEven: 2, TD05_CurrentBalance: 800 }),
                { portfolioId: 'portfolio-1', amount: 0, resultValue: 'B' },
            );

            expect(result.data.id).toBe('transaction-1');
            const params = getPortfolioUpdateParams();
            expect(params[0]).toBe(800); // balance unchanged
            expect(params[7]).toBe(1); // totalTrade + 1
            expect(params[10]).toBe(3); // totalBreakEven 2 + 1
            expect(params[11]).toBe(3); // sumTotalBreakEven max
            expect(params[13]).toBe('B');
        });

        it('should use today as tradeDate when not provided in dto', async () => {
            await runCreate(
                buildPortfolioRow(),
                { portfolioId: 'portfolio-1', amount: 100, resultValue: 'W' },
            );
            const insertParams = mockClient.query.mock.calls[2][1];
            const today = new Date().toISOString().split('T')[0];
            expect(insertParams[4]).toBe(today); // tradeDate at index 4
        });

        it('should use provided tradeDate when given in dto', async () => {
            await runCreate(
                buildPortfolioRow(),
                { portfolioId: 'portfolio-1', amount: 100, resultValue: 'W', tradeDate: '2026-01-15' },
            );
            const insertParams = mockClient.query.mock.calls[2][1];
            expect(insertParams[4]).toBe('2026-01-15');
        });

        it('should throw NotFound if portfolio does not exist', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [] }); // SELECT portfolio FOR UPDATE

            await expect(
                service.createTransaction({ portfolioId: 'not-exist', amount: 100, resultValue: 'W' }),
            ).rejects.toThrow('Portfolio not found');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should reject a loss with insufficient balance', async () => {
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [buildPortfolioRow({ TD05_CurrentBalance: 100 })] }); // SELECT

            await expect(
                service.createTransaction({ portfolioId: 'portfolio-1', amount: 200, resultValue: 'L' }),
            ).rejects.toThrow('Insufficient balance for this loss');
            expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });
});
