import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { StrategyService } from './strategy.service';

describe('StrategyService', () => {
    let service: StrategyService;
    let mockQuery: jest.Mock;
    let mockClient: any;

    beforeEach(async () => {
        mockQuery = jest.fn();
        mockClient = {
            query: jest.fn(),
            release: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                StrategyService,
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

        service = module.get<StrategyService>(StrategyService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllStrategies', () => {
        it('should return all strategies with aggregated checklists', async () => {
            const now = new Date();
            const mockRows = [
                {
                    TD03_Id: 'strategy-1',
                    TD03_Name: 'Breakout',
                    TD03_RiskRewardRatio: 2,
                    TD03_RiskPerTrade: 1,
                    TD03_Description: 'A breakout strategy',
                    TD03_IsActive: true,
                    TD03_CreatedBy: 'admin',
                    TD03_CreatedAt: now,
                    TD03_ModifiedBy: 'admin',
                    TD03_ModifiedAt: now,
                    TD02_Id: 'checklist-1',
                    TD04_IsActive: true,
                    TD04_IsRequired: false,
                },
                {
                    TD03_Id: 'strategy-1',
                    TD03_Name: 'Breakout',
                    TD03_RiskRewardRatio: 2,
                    TD03_RiskPerTrade: 1,
                    TD03_Description: 'A breakout strategy',
                    TD03_IsActive: true,
                    TD03_CreatedBy: 'admin',
                    TD03_CreatedAt: now,
                    TD03_ModifiedBy: 'admin',
                    TD03_ModifiedAt: now,
                    TD02_Id: 'checklist-2',
                    TD04_IsActive: true,
                    TD04_IsRequired: true,
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 2 });

            const result = await service.getAllStrategies();

            expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Breakout');
            expect(result.data[0].checklists).toHaveLength(2);
            expect(result.data[0].checklists[0].checklistId).toBe('checklist-1');
            expect(result.data[0].checklists[1].checklistId).toBe('checklist-2');
        });

        it('should return strategy with empty checklists when no TD04 rows linked', async () => {
            const now = new Date();
            const mockRows = [
                {
                    TD03_Id: 'strategy-1',
                    TD03_Name: 'Breakout',
                    TD03_RiskRewardRatio: null,
                    TD03_RiskPerTrade: null,
                    TD03_Description: null,
                    TD03_IsActive: true,
                    TD03_CreatedBy: 'admin',
                    TD03_CreatedAt: now,
                    TD03_ModifiedBy: 'admin',
                    TD03_ModifiedAt: now,
                    TD02_Id: null,
                    TD04_IsActive: null,
                    TD04_IsRequired: null,
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 1 });

            const result = await service.getAllStrategies();

            expect(result.total).toBe(1);
            expect(result.data[0].checklists).toHaveLength(0);
        });
    });

    describe('getStrategyById', () => {
        it('should return a single strategy with checklists', async () => {
            const now = new Date();
            const mockRows = [
                {
                    TD03_Id: 'strategy-1',
                    TD03_Name: 'Breakout',
                    TD03_RiskRewardRatio: 2,
                    TD03_RiskPerTrade: 1,
                    TD03_Description: 'desc',
                    TD03_IsActive: true,
                    TD03_CreatedBy: 'admin',
                    TD03_CreatedAt: now,
                    TD03_ModifiedBy: 'admin',
                    TD03_ModifiedAt: now,
                    TD02_Id: 'checklist-1',
                    TD04_IsActive: true,
                    TD04_IsRequired: false,
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRows });

            const result = await service.getStrategyById('strategy-1');

            expect(result.data.id).toBe('strategy-1');
            expect(result.data.name).toBe('Breakout');
            expect(result.data.checklists).toHaveLength(1);
        });

        it('should throw error if strategy not found', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            await expect(service.getStrategyById('not-exist')).rejects.toThrow('Not found any strategy');
        });
    });

    describe('createStrategy', () => {
        it('should create a new strategy and return its id', async () => {
            const mockDto = { name: 'Breakout', riskRewardRatio: 2, riskPerTrade: 1, description: 'desc' };
            mockQuery.mockResolvedValue({ rows: [{ TD03_Id: 'strategy-1' }] });

            const result = await service.createStrategy(mockDto);

            expect(result.data.id).toBe('strategy-1');
            expect(mockQuery).toHaveBeenCalledTimes(1);
        });

        it('should create strategy with only required fields', async () => {
            const mockDto = { name: 'Simple' };
            mockQuery.mockResolvedValue({ rows: [{ TD03_Id: 'strategy-2' }] });

            const result = await service.createStrategy(mockDto);

            expect(result.data.id).toBe('strategy-2');
        });
    });

    describe('updateStrategyById', () => {
        it('should update strategy with transaction', async () => {
            const now = new Date();
            const mockDto = { id: 'strategy-1', name: 'Updated', riskRewardRatio: 3, riskPerTrade: 2, description: 'new', isActive: true };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({
                    rows: [{
                        TD03_Id: 'strategy-1',
                        TD03_Name: 'Updated',
                        TD03_RiskRewardRatio: 3,
                        TD03_RiskPerTrade: 2,
                        TD03_Description: 'new',
                        TD03_IsActive: true,
                        TD03_ModifiedAt: now,
                    }],
                }) // UPDATE
                .mockResolvedValueOnce(undefined); // COMMIT

            const result = await service.updateStrategyById(mockDto);

            expect(result.data.id).toBe('strategy-1');
            expect(result.data.name).toBe('Updated');
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should rollback on error', async () => {
            const mockDto = { id: 'strategy-1', name: 'Updated', isActive: true };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(new Error('DB error')); // UPDATE throws

            await expect(service.updateStrategyById(mockDto as any)).rejects.toThrow('DB error');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('updateStrategyActiveStatusById', () => {
        it('should update active status and return undefined', async () => {
            const mockDto = { id: 'strategy-1', isActive: false };
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.updateStrategyActiveStatusById(mockDto);

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });

    describe('deleteStrategyById', () => {
        it('should delete strategy and return undefined', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.deleteStrategyById('strategy-1');

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});
