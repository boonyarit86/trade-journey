import { Test, TestingModule } from '@nestjs/testing';
import { StrategyChecklistController } from './strategy-checklist.controller';
import { StrategyChecklistService } from './strategy-checklist.service';

describe('StrategyChecklistController', () => {
    let controller: StrategyChecklistController;
    let service: StrategyChecklistService;

    const mockStrategyChecklistService = {
        getAllStrategyChecklists: jest.fn(),
        getStrategyChecklistsByStrategyId: jest.fn(),
        createStrategyChecklist: jest.fn(),
        updateStrategyChecklist: jest.fn(),
        updateStrategyChecklistActiveStatus: jest.fn(),
        deleteStrategyChecklist: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StrategyChecklistController],
            providers: [
                {
                    provide: StrategyChecklistService,
                    useValue: mockStrategyChecklistService,
                },
            ],
        }).compile();

        controller = module.get<StrategyChecklistController>(StrategyChecklistController);
        service = module.get<StrategyChecklistService>(StrategyChecklistService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getAllStrategyChecklists', async () => {
        const mockResult = { total: 1, data: [] };
        mockStrategyChecklistService.getAllStrategyChecklists.mockResolvedValue(mockResult);

        const result = await controller.getAllStrategyChecklists();
        expect(service.getAllStrategyChecklists).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
    });

    it('should call getStrategyChecklistsByStrategyId', async () => {
        const mockStrategyId = 'strategy-1';
        const mockResult = { total: 1, data: [{ checklistId: 'checklist-1', strategyId: mockStrategyId }] };
        mockStrategyChecklistService.getStrategyChecklistsByStrategyId.mockResolvedValue(mockResult);

        const result = await controller.getStrategyChecklistsByStrategyId(mockStrategyId);
        expect(service.getStrategyChecklistsByStrategyId).toHaveBeenCalledWith(mockStrategyId);
        expect(result).toEqual(mockResult);
    });

    it('should call createStrategyChecklist', async () => {
        const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isRequired: true };
        const mockResult = { data: { strategyId: 'strategy-1', checklistId: 'checklist-1' } };
        mockStrategyChecklistService.createStrategyChecklist.mockResolvedValue(mockResult);

        const result = await controller.createStrategyChecklist(mockDto);
        expect(service.createStrategyChecklist).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updateStrategyChecklist', async () => {
        const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: true, isRequired: false };
        const mockResult = { data: { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: true, isRequired: false, modifiedAt: new Date() } };
        mockStrategyChecklistService.updateStrategyChecklist.mockResolvedValue(mockResult);

        const result = await controller.updateStrategyChecklist(mockDto);
        expect(service.updateStrategyChecklist).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updateStrategyChecklistActiveStatus', async () => {
        const mockDto = { strategyId: 'strategy-1', checklistId: 'checklist-1', isActive: false };
        mockStrategyChecklistService.updateStrategyChecklistActiveStatus.mockResolvedValue(undefined);

        const result = await controller.updateStrategyChecklistActiveStatus(mockDto);
        expect(service.updateStrategyChecklistActiveStatus).toHaveBeenCalledWith(mockDto);
        expect(result).toBeUndefined();
    });

    it('should call deleteStrategyChecklist', async () => {
        mockStrategyChecklistService.deleteStrategyChecklist.mockResolvedValue(undefined);

        const result = await controller.deleteStrategyChecklist('strategy-1', 'checklist-1');
        expect(service.deleteStrategyChecklist).toHaveBeenCalledWith('strategy-1', 'checklist-1');
        expect(result).toBeUndefined();
    });
});
