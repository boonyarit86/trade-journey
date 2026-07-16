import { Test, TestingModule } from '@nestjs/testing';
import { AssetController } from './asset.controller';
import { AssetService } from './asset.service';

describe('AssetController', () => {
  let controller: AssetController;
  let service: AssetService;

  const mockAssetService = {
    getAllAssetTypes: jest.fn(),
    getAssetTypeById: jest.fn(),
    createAssetType: jest.fn(),
    updateAssetTypeById: jest.fn(),
    updateAssetTypeActiveStatusById: jest.fn(),
    deleteAssetTypeById: jest.fn(),
    getAllAssets: jest.fn(),
    getAssetById: jest.fn(),
    createAsset: jest.fn(),
    updateAssetById: jest.fn(),
    updateAssetActiveStatusById: jest.fn(),
    deleteAssetById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetController],
      providers: [
        {
          provide: AssetService,
          useValue: mockAssetService,
        },
      ],
    }).compile();

    controller = module.get<AssetController>(AssetController);
    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Asset Item endpoints', () => {
    it('should call getAllAssets', async () => {
      const mockResult = { total: 2, data: [] };
      mockAssetService.getAllAssets.mockResolvedValue(mockResult);

      const result = await controller.getAllAssets();
      expect(service.getAllAssets).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should call getAssetById', async () => {
      const mockId = '123';
      const mockResult = { data: { id: mockId, name: 'XAUUSD' } };
      mockAssetService.getAssetById.mockResolvedValue(mockResult);

      const result = await controller.getAssetById(mockId);
      expect(service.getAssetById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockResult);
    });

    it('should call createAsset', async () => {
      const mockDto = { name: 'XAUUSD', assetTypeId: '456' };
      const mockResult = { data: { id: '789' } };
      mockAssetService.createAsset.mockResolvedValue(mockResult);

      const result = await controller.createAsset(mockDto);
      expect(service.createAsset).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });

    it('should call updateAssetById', async () => {
      const mockDto = { id: '123', name: 'XAUUSD', assetTypeId: '456', isActive: true };
      const mockResult = { data: { id: '123', name: 'XAUUSD', isActive: true, modifiedAt: new Date() } };
      mockAssetService.updateAssetById.mockResolvedValue(mockResult);

      const result = await controller.updateAssetById(mockDto);
      expect(service.updateAssetById).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });

    it('should call updateAssetActiveStatusById', async () => {
      const mockDto = { id: '123', isActive: false };
      mockAssetService.updateAssetActiveStatusById.mockResolvedValue(undefined);

      const result = await controller.updateAssetActiveStatusById(mockDto);
      expect(service.updateAssetActiveStatusById).toHaveBeenCalledWith(mockDto);
      expect(result).toBeUndefined();
    });

    it('should call deleteAssetById', async () => {
      const mockId = '123';
      mockAssetService.deleteAssetById.mockResolvedValue(undefined);

      const result = await controller.deleteAssetById(mockId);
      expect(service.deleteAssetById).toHaveBeenCalledWith(mockId);
      expect(result).toBeUndefined();
    });
  });
});
