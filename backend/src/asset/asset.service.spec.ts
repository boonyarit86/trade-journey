import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { AssetService } from './asset.service';

describe('AssetService', () => {
  let service: AssetService;
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
        AssetService,
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

    service = module.get<AssetService>(AssetService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllAssets', () => {
    it('should return all assets with joined asset type data', async () => {
      const mockRows = [
        {
          CM02_Id: '1',
          CM01_Id: '10',
          CM02_Name: 'XAUUSD',
          CM02_IsActive: true,
          CM02_CreatedBy: 'admin',
          CM02_CreatedAt: new Date(),
          CM02_ModifiedBy: 'admin',
          CM02_ModifiedAt: new Date(),
          CM01_Name: 'Gold',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 1 });

      const result = await service.getAllAssets();

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('XAUUSD');
      expect(result.data[0].assetTypeName).toBe('Gold');
    });
  });

  describe('getAssetById', () => {
    it('should return single asset by id', async () => {
      const mockRows = [
        {
          CM02_Id: '1',
          CM01_Id: '10',
          CM02_Name: 'XAUUSD',
          CM02_IsActive: true,
          CM02_CreatedBy: 'admin',
          CM02_CreatedAt: new Date(),
          CM02_ModifiedBy: 'admin',
          CM02_ModifiedAt: new Date(),
          CM01_Name: 'Gold',
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const result = await service.getAssetById('1');

      expect(result.data.id).toBe('1');
      expect(result.data.name).toBe('XAUUSD');
    });

    it('should throw error if asset not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(service.getAssetById('999')).rejects.toThrow('Not found any asset');
    });
  });

  describe('createAsset', () => {
    it('should create a new asset', async () => {
      const mockDto = { name: 'XAUUSD', assetTypeId: '10' };
      mockQuery
        .mockResolvedValueOnce({ rows: [{ CM01_Id: '10' }] })
        .mockResolvedValueOnce({ rows: [{ CM02_Id: '1' }] });

      const result = await service.createAsset(mockDto);

      expect(result.data.id).toBe('1');
      expect(mockQuery).toHaveBeenCalledTimes(2);
    });

    it('should throw error if asset type not found', async () => {
      const mockDto = { name: 'XAUUSD', assetTypeId: '999' };
      mockQuery.mockResolvedValueOnce({ rows: [] });

      await expect(service.createAsset(mockDto)).rejects.toThrow('Asset type not found');
    });
  });

  describe('updateAssetById', () => {
    it('should update asset with transaction', async () => {
      const mockDto = { id: '1', name: 'XAUUSD', assetTypeId: '10', isActive: true };
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ rows: [{ CM01_Id: '10' }] })
        .mockResolvedValueOnce({
          rows: [{ CM02_Id: '1', CM02_Name: 'XAUUSD', CM02_IsActive: true, CM02_ModifiedAt: new Date() }],
        })
        .mockResolvedValueOnce(undefined);

      const result = await service.updateAssetById(mockDto);

      expect(result.data.id).toBe('1');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const mockDto = { id: '1', name: 'XAUUSD', assetTypeId: '999', isActive: true };
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({ rows: [] });

      await expect(service.updateAssetById(mockDto)).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateAssetActiveStatusById', () => {
    it('should update asset active status', async () => {
      const mockDto = { id: '1', isActive: false };
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await service.updateAssetActiveStatusById(mockDto);

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('deleteAssetById', () => {
    it('should delete asset by id', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await service.deleteAssetById('1');

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
