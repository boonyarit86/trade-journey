import { Test, TestingModule } from '@nestjs/testing';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';

describe('StrategyController', () => {
    let controller: StrategyController;
    let service: StrategyService;

    const mockStrategyService = {
        getAllStrategies: jest.fn(),
        getStrategyById: jest.fn(),
        createStrategy: jest.fn(),
        updateStrategyById: jest.fn(),
        updateStrategyActiveStatusById: jest.fn(),
        deleteStrategyById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [StrategyController],
            providers: [
                {
                    provide: StrategyService,
                    useValue: mockStrategyService,
                },
            ],
        }).compile();

        controller = module.get<StrategyController>(StrategyController);
        service = module.get<StrategyService>(StrategyService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getAllStrategies', async () => {
        const mockResult = { total: 1, data: [] };
        mockStrategyService.getAllStrategies.mockResolvedValue(mockResult);

        const result = await controller.getAllStrategies();
        expect(service.getAllStrategies).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
    });

    it('should call getStrategyById', async () => {
        const mockId = 'strategy-1';
        const mockResult = { data: { id: mockId, name: 'Breakout', checklists: [] } };
        mockStrategyService.getStrategyById.mockResolvedValue(mockResult);

        const result = await controller.getStrategyById(mockId);
        expect(service.getStrategyById).toHaveBeenCalledWith(mockId);
        expect(result).toEqual(mockResult);
    });

    it('should call createStrategy', async () => {
        const mockDto = { name: 'Breakout', riskRewardRatio: 2, riskPerTrade: 1, description: 'desc' };
        const mockResult = { data: { id: 'strategy-1' } };
        mockStrategyService.createStrategy.mockResolvedValue(mockResult);

        const result = await controller.createStrategy(mockDto);
        expect(service.createStrategy).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updateStrategyById', async () => {
        const mockDto = { id: 'strategy-1', name: 'Updated', riskRewardRatio: 3, riskPerTrade: 2, description: 'new', isActive: true };
        const mockResult = { data: { id: 'strategy-1', name: 'Updated', isActive: true, modifiedAt: new Date() } };
        mockStrategyService.updateStrategyById.mockResolvedValue(mockResult);

        const result = await controller.updateStrategyById(mockDto);
        expect(service.updateStrategyById).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updateStrategyActiveStatusById', async () => {
        const mockDto = { id: 'strategy-1', isActive: false };
        mockStrategyService.updateStrategyActiveStatusById.mockResolvedValue(undefined);

        const result = await controller.updateStrategyActiveStatusById(mockDto);
        expect(service.updateStrategyActiveStatusById).toHaveBeenCalledWith(mockDto);
        expect(result).toBeUndefined();
    });

    it('should call deleteStrategyById', async () => {
        const mockId = 'strategy-1';
        mockStrategyService.deleteStrategyById.mockResolvedValue(undefined);

        const result = await controller.deleteStrategyById(mockId);
        expect(service.deleteStrategyById).toHaveBeenCalledWith(mockId);
        expect(result).toBeUndefined();
    });
});
