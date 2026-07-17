import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
    let service: PortfolioService;
    let mockQuery: jest.Mock;
    let mockClient: any;

    const buildRow = (overrides: Partial<Record<string, unknown>> = {}) => {
        const now = new Date();
        return {
            TD05_Id: 'portfolio-1',
            TD01_Id: 'project-1',
            CM02_Id: 'asset-1',
            TD03_Strategy: 'strategy-1',
            TD05_Name: 'Main Portfolio',
            TD05_InitBalance: 1000,
            TD05_CurrentBalance: 1000,
            TD05_TotalConsecutiveWin: 0,
            TD05_TotalConsecutiveLoss: 0,
            TD05_TotalConsecutiveWinDay: 0,
            TD05_TotalConsecutiveLossDay: 0,
            TD05_SumTotalConsecutiveWin: 0,
            TD05_SumTotalConsecutiveLoss: 0,
            TD05_SumTotalConsecutiveWinDay: 0,
            TD05_SumTotalConsecutiveLossDay: 0,
            TD05_MaxProfitAmount: 0,
            TD05_MaxLossAmount: 0,
            TD05_AverageRiskRewardRatio: 0,
            TD05_TotalTrade: 0,
            TD05_TotalWinTrade: 0,
            TD05_TotalLossTrade: 0,
            TD05_WinRatePercent: 0,
            TD05_TotalBreakEven: 0,
            TD05_SumTotalBreakEven: 0,
            CM05_Value: null,
            TD05_Description: null,
            TD05_IsActive: true,
            TD05_CreatedBy: 'admin',
            TD05_CreatedAt: now,
            TD05_ModifiedBy: 'admin',
            TD05_ModifiedAt: now,
            TD01_Name: 'My Project',
            CM02_Name: 'XAUUSD',
            CM01_Name: 'Gold',
            TD03_Name: 'Breakout',
            ...overrides,
        };
    };

    beforeEach(async () => {
        mockQuery = jest.fn();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PortfolioService,
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

        service = module.get<PortfolioService>(PortfolioService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllPortfolios', () => {
        it('should return all portfolios with joined project, asset, asset type, and strategy data', async () => {
            mockQuery.mockResolvedValue({ rows: [buildRow()], rowCount: 1 });

            const result = await service.getAllPortfolios();

            expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Main Portfolio');
            expect(result.data[0].projectName).toBe('My Project');
            expect(result.data[0].assetName).toBe('XAUUSD');
            expect(result.data[0].assetTypeName).toBe('Gold');
            expect(result.data[0].strategyName).toBe('Breakout');
            expect(result.data[0].totalBreakEven).toBe(0);
            expect(result.data[0].sumTotalBreakEven).toBe(0);
            expect(result.data[0].cm05Value).toBeNull();
        });

        it('should return null strategy fields when no strategy is linked', async () => {
            mockQuery.mockResolvedValue({
                rows: [buildRow({ TD03_Strategy: null, TD03_Name: null })],
                rowCount: 1,
            });

            const result = await service.getAllPortfolios();

            expect(result.data[0].strategyId).toBeNull();
            expect(result.data[0].strategyName).toBeNull();
        });

        it('should map CM05_Value when present', async () => {
            mockQuery.mockResolvedValue({
                rows: [buildRow({ CM05_Value: 'W', TD05_TotalBreakEven: 2, TD05_SumTotalBreakEven: 5 })],
                rowCount: 1,
            });

            const result = await service.getAllPortfolios();

            expect(result.data[0].cm05Value).toBe('W');
            expect(result.data[0].totalBreakEven).toBe(2);
            expect(result.data[0].sumTotalBreakEven).toBe(5);
        });
    });

    describe('getPortfolioById', () => {
        it('should return a single portfolio by id', async () => {
            mockQuery.mockResolvedValue({ rows: [buildRow()] });

            const result = await service.getPortfolioById('portfolio-1');

            expect(result.data.id).toBe('portfolio-1');
            expect(result.data.projectName).toBe('My Project');
        });

        it('should throw error if portfolio not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(service.getPortfolioById('not-exist')).rejects.toThrow('Not found any portfolio');
        });
    });

    describe('createPortfolio', () => {
        it('should create a portfolio and set current balance to init balance', async () => {
            const mockDto = { name: 'Main Portfolio', projectId: 'project-1', assetId: 'asset-1', strategyId: 'strategy-1', initBalance: 1000 };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD01_Id: 'project-1' }] }) // project check
                .mockResolvedValueOnce({ rows: [{ CM02_Id: 'asset-1' }] }) // asset check
                .mockResolvedValueOnce({ rows: [{ TD03_Id: 'strategy-1' }] }) // strategy check
                .mockResolvedValueOnce({ rows: [{ TD05_Id: 'portfolio-1' }] }); // insert

            const result = await service.createPortfolio(mockDto);

            expect(result.data.id).toBe('portfolio-1');
            expect(mockQuery).toHaveBeenCalledTimes(4);
            const insertCall = mockQuery.mock.calls[3];
            expect(insertCall[1]).toEqual(['project-1', 'asset-1', 'strategy-1', 'Main Portfolio', 1000, 1000, null, 'admin', 'admin']);
        });

        it('should create a portfolio without a strategy', async () => {
            const mockDto = { name: 'No Strategy Portfolio', projectId: 'project-1', assetId: 'asset-1', initBalance: 500 };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD01_Id: 'project-1' }] })
                .mockResolvedValueOnce({ rows: [{ CM02_Id: 'asset-1' }] })
                .mockResolvedValueOnce({ rows: [{ TD05_Id: 'portfolio-2' }] });

            const result = await service.createPortfolio(mockDto);

            expect(result.data.id).toBe('portfolio-2');
            expect(mockQuery).toHaveBeenCalledTimes(3);
        });

        it('should throw error if project not found', async () => {
            const mockDto = { name: 'Bad Portfolio', projectId: 'not-exist', assetId: 'asset-1', initBalance: 100 };
            mockQuery.mockResolvedValueOnce({ rows: [] });

            await expect(service.createPortfolio(mockDto)).rejects.toThrow('Project not found');
        });

        it('should throw error if asset not found', async () => {
            const mockDto = { name: 'Bad Portfolio', projectId: 'project-1', assetId: 'not-exist', initBalance: 100 };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD01_Id: 'project-1' }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(service.createPortfolio(mockDto)).rejects.toThrow('Asset not found');
        });

        it('should throw error if strategy not found', async () => {
            const mockDto = { name: 'Bad Portfolio', projectId: 'project-1', assetId: 'asset-1', strategyId: 'not-exist', initBalance: 100 };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD01_Id: 'project-1' }] })
                .mockResolvedValueOnce({ rows: [{ CM02_Id: 'asset-1' }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(service.createPortfolio(mockDto)).rejects.toThrow('Strategy not found');
        });
    });

    describe('updatePortfolioById', () => {
        it('should update portfolio with transaction', async () => {
            const now = new Date();
            const mockDto = {
                id: 'portfolio-1',
                name: 'Updated Portfolio',
                projectId: 'project-1',
                assetId: 'asset-1',
                strategyId: 'strategy-1',
                initBalance: 2000,
                isActive: true,
            };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [{ TD01_Id: 'project-1' }] }) // project check
                .mockResolvedValueOnce({ rows: [{ CM02_Id: 'asset-1' }] }) // asset check
                .mockResolvedValueOnce({ rows: [{ TD03_Id: 'strategy-1' }] }) // strategy check
                .mockResolvedValueOnce({
                    rows: [{ TD05_Id: 'portfolio-1', TD05_Name: 'Updated Portfolio', TD05_InitBalance: 2000, TD05_IsActive: true, TD05_ModifiedAt: now }],
                }) // UPDATE
                .mockResolvedValueOnce(undefined); // COMMIT

            const result = await service.updatePortfolioById(mockDto);

            expect(result.data.id).toBe('portfolio-1');
            expect(result.data.name).toBe('Updated Portfolio');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should rollback on error', async () => {
            const mockDto = { id: 'portfolio-1', name: 'Updated Portfolio', projectId: 'not-exist', assetId: 'asset-1', initBalance: 2000, isActive: true };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({ rows: [] }); // project check fails

            await expect(service.updatePortfolioById(mockDto)).rejects.toThrow('Project not found');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('updatePortfolioActiveStatusById', () => {
        it('should update active status and return undefined', async () => {
            const mockDto = { id: 'portfolio-1', isActive: false };
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.updatePortfolioActiveStatusById(mockDto);

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });

    describe('deletePortfolioById', () => {
        it('should delete portfolio and return undefined', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.deletePortfolioById('portfolio-1');

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});
