import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { StrategyChecklistService } from './strategy-checklist.service';

describe('StrategyChecklistService', () => {
    let service: StrategyChecklistService;
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
                StrategyChecklistService,
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

        service = module.get<StrategyChecklistService>(StrategyChecklistService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getAllStrategyChecklists', () => {
        it('should return all strategy-checklist links', async () => {
            const now = new Date();
            const mockRows = [
                {
                    TD02_Id: 'checklist-1',
                    TD03_Id: 'strategy-1',
                    TD04_IsActive: true,
                    TD04_IsRequired: false,
                    TD04_CreatedBy: 'admin',
                    TD04_CreatedAt: now,
                    TD04_ModifiedBy: 'admin',
                    TD04_ModifiedAt: now,
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 1 });

            const result = await service.getAllStrategyChecklists();

            expect(result.total).toBe(1);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].checklistId).toBe('checklist-1');
            expect(result.data[0].strategyId).toBe('strategy-1');
        });
    });

    describe('getStrategyChecklistsByStrategyId', () => {
        it('should return links for a given strategy', async () => {
            const now = new Date();
            const mockRows = [
                {
                    TD02_Id: 'checklist-1',
                    TD03_Id: 'strategy-1',
                    TD04_IsActive: true,
                    TD04_IsRequired: true,
                    TD04_CreatedBy: 'admin',
                    TD04_CreatedAt: now,
                    TD04_ModifiedBy: 'admin',
                    TD04_ModifiedAt: now,
                },
            ];
            mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 1 });

            const result = await service.getStrategyChecklistsByStrategyId('strategy-1');

            expect(result.total).toBe(1);
            expect(result.data[0].isRequired).toBe(true);
        });
    });

    describe('createStrategyChecklist', () => {
        it('should create a link using provided isRequired', async () => {
            const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isRequired: true };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD03_Id: 'strategy-1' }] }) // strategy check
                .mockResolvedValueOnce({ rows: [{ TD02_Id: 'checklist-1', TD02_IsRequired: false }] }) // checklist check
                .mockResolvedValueOnce({ rows: [] }); // INSERT

            const result = await service.createStrategyChecklist(mockDto);

            expect(result.data.strategyId).toBe('strategy-1');
            expect(result.data.checklistId).toBe('checklist-1');
            expect(mockQuery).toHaveBeenCalledTimes(3);
            const insertCall = mockQuery.mock.calls[2];
            expect(insertCall[1]).toContain(true); // isRequired = true (overridden)
        });

        it('should default isRequired from TD02_IsRequired when not provided', async () => {
            const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1' };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD03_Id: 'strategy-1' }] }) // strategy check
                .mockResolvedValueOnce({ rows: [{ TD02_Id: 'checklist-1', TD02_IsRequired: true }] }) // checklist check
                .mockResolvedValueOnce({ rows: [] }); // INSERT

            await service.createStrategyChecklist(mockDto);

            const insertCall = mockQuery.mock.calls[2];
            expect(insertCall[1]).toContain(true); // isRequired defaults to TD02_IsRequired = true
        });

        it('should throw error if strategy not found', async () => {
            const mockDto = { strategyId: '999', checklistId: 'checklist-1' };
            mockQuery.mockResolvedValueOnce({ rows: [] });

            await expect(service.createStrategyChecklist(mockDto)).rejects.toThrow('Strategy not found');
        });

        it('should throw error if checklist not found', async () => {
            const mockDto = { strategyId: 'strategy-1', checklistId: '999' };
            mockQuery
                .mockResolvedValueOnce({ rows: [{ TD03_Id: 'strategy-1' }] })
                .mockResolvedValueOnce({ rows: [] });

            await expect(service.createStrategyChecklist(mockDto)).rejects.toThrow('Checklist not found');
        });
    });

    describe('updateStrategyChecklist', () => {
        it('should update link with transaction', async () => {
            const now = new Date();
            const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: false, isRequired: true };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockResolvedValueOnce({
                    rows: [{
                        TD03_Id: 'strategy-1',
                        TD02_Id: 'checklist-1',
                        TD04_IsActive: false,
                        TD04_IsRequired: true,
                        TD04_ModifiedAt: now,
                    }],
                }) // UPDATE
                .mockResolvedValueOnce(undefined); // COMMIT

            const result = await service.updateStrategyChecklist(mockDto);

            expect(result.data.strategyId).toBe('strategy-1');
            expect(result.data.isActive).toBe(false);
            expect(result.data.isRequired).toBe(true);
            expect(mockClient.release).toHaveBeenCalled();
        });

        it('should rollback on error', async () => {
            const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: true, isRequired: false };
            mockClient.query
                .mockResolvedValueOnce(undefined) // BEGIN
                .mockRejectedValueOnce(new Error('DB error')); // UPDATE throws

            await expect(service.updateStrategyChecklist(mockDto)).rejects.toThrow('DB error');
            expect(mockClient.release).toHaveBeenCalled();
        });
    });

    describe('updateStrategyChecklistActiveStatus', () => {
        it('should update active status and return undefined', async () => {
            const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: false };
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.updateStrategyChecklistActiveStatus(mockDto);

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });

    describe('deleteStrategyChecklist', () => {
        it('should delete link and return undefined', async () => {
            mockQuery.mockResolvedValue({ rows: [] });

            const result = await service.deleteStrategyChecklist('strategy-1', 'checklist-1');

            expect(result).toBeUndefined();
            expect(mockQuery).toHaveBeenCalled();
        });
    });
});
