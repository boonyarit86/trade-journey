import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';

describe('PortfolioController', () => {
    let controller: PortfolioController;
    let service: PortfolioService;

    const mockPortfolioService = {
        getAllPortfolios: jest.fn(),
        getPortfolioById: jest.fn(),
        createPortfolio: jest.fn(),
        updatePortfolioById: jest.fn(),
        updatePortfolioActiveStatusById: jest.fn(),
        deletePortfolioById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [PortfolioController],
            providers: [
                {
                    provide: PortfolioService,
                    useValue: mockPortfolioService,
                },
            ],
        }).compile();

        controller = module.get<PortfolioController>(PortfolioController);
        service = module.get<PortfolioService>(PortfolioService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getAllPortfolios', async () => {
        const mockResult = { total: 1, data: [] };
        mockPortfolioService.getAllPortfolios.mockResolvedValue(mockResult);

        const result = await controller.getAllPortfolios();
        expect(service.getAllPortfolios).toHaveBeenCalled();
        expect(result).toEqual(mockResult);
    });

    it('should call getPortfolioById', async () => {
        const mockId = 'portfolio-1';
        const mockResult = { data: { id: mockId, name: 'Main Portfolio' } };
        mockPortfolioService.getPortfolioById.mockResolvedValue(mockResult);

        const result = await controller.getPortfolioById(mockId);
        expect(service.getPortfolioById).toHaveBeenCalledWith(mockId);
        expect(result).toEqual(mockResult);
    });

    it('should call createPortfolio', async () => {
        const mockDto = { name: 'Main Portfolio', projectId: 'project-1', assetId: 'asset-1', initBalance: 1000 };
        const mockResult = { data: { id: 'portfolio-1' } };
        mockPortfolioService.createPortfolio.mockResolvedValue(mockResult);

        const result = await controller.createPortfolio(mockDto);
        expect(service.createPortfolio).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updatePortfolioById', async () => {
        const mockDto = {
            id: 'portfolio-1',
            name: 'Updated Portfolio',
            projectId: 'project-1',
            assetId: 'asset-1',
            initBalance: 2000,
            isActive: true,
        };
        const mockResult = { data: { id: 'portfolio-1', name: 'Updated Portfolio', initBalance: 2000, isActive: true, modifiedAt: new Date() } };
        mockPortfolioService.updatePortfolioById.mockResolvedValue(mockResult);

        const result = await controller.updatePortfolioById(mockDto);
        expect(service.updatePortfolioById).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });

    it('should call updatePortfolioActiveStatusById', async () => {
        const mockDto = { id: 'portfolio-1', isActive: false };
        mockPortfolioService.updatePortfolioActiveStatusById.mockResolvedValue(undefined);

        const result = await controller.updatePortfolioActiveStatusById(mockDto);
        expect(service.updatePortfolioActiveStatusById).toHaveBeenCalledWith(mockDto);
        expect(result).toBeUndefined();
    });

    it('should call deletePortfolioById', async () => {
        const mockId = 'portfolio-1';
        mockPortfolioService.deletePortfolioById.mockResolvedValue(undefined);

        const result = await controller.deletePortfolioById(mockId);
        expect(service.deletePortfolioById).toHaveBeenCalledWith(mockId);
        expect(result).toBeUndefined();
    });
});
