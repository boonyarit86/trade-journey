import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatusService } from './transaction-status.service';
import { PgService } from 'src/database/pg.service';

const mockRow = {
  CM03_Id: 'uuid-1',
  CM03_Text: 'win',
  CM03_Value: 'W',
  CM03_ColorCode: '#52c41a',
  CM03_IsActive: true,
  CM03_CreatedBy: 'admin',
  CM03_CreatedAt: new Date('2024-01-01'),
  CM03_ModifiedBy: 'admin',
  CM03_ModifiedAt: new Date('2024-01-01'),
};

const mockMappedStatus = {
  id: 'uuid-1',
  text: 'win',
  value: 'W',
  colorCode: '#52c41a',
  isActive: true,
  createdBy: 'admin',
  createdAt: new Date('2024-01-01'),
  modifiedBy: 'admin',
  modifiedAt: new Date('2024-01-01'),
};

describe('TransactionStatusService', () => {
  let service: TransactionStatusService;

  const mockClient = {
    query: jest.fn(),
    release: jest.fn(),
  };

  const mockPool = {
    query: jest.fn(),
    connect: jest.fn().mockResolvedValue(mockClient),
  };

  const mockPgService = {
    getPool: jest.fn().mockReturnValue(mockPool),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionStatusService,
        {
          provide: PgService,
          useValue: mockPgService,
        },
      ],
    }).compile();

    service = module.get<TransactionStatusService>(TransactionStatusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockPgService.getPool.mockReturnValue(mockPool);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllTransactionStatuses', () => {
    it('should return all statuses mapped correctly', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockRow], rowCount: 1 });

      const result = await service.getAllTransactionStatuses();
      expect(result.total).toBe(1);
      expect(result.data[0]).toEqual(mockMappedStatus);
    });

    it('should return empty list when no rows', async () => {
      mockPool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const result = await service.getAllTransactionStatuses();
      expect(result.total).toBe(0);
      expect(result.data).toEqual([]);
    });
  });

  describe('getTransactionStatusById', () => {
    it('should return a single mapped status', async () => {
      mockPool.query.mockResolvedValue({ rows: [mockRow] });

      const result = await service.getTransactionStatusById('uuid-1');
      expect(result.data).toEqual(mockMappedStatus);
    });

    it('should throw when not found', async () => {
      mockPool.query.mockResolvedValue({ rows: [] });

      await expect(service.getTransactionStatusById('non-existent')).rejects.toThrow(
        'Not found any transaction status',
      );
    });
  });

  describe('createTransactionStatus', () => {
    it('should insert and return the new id', async () => {
      mockPool.query.mockResolvedValue({ rows: [{ CM03_Id: 'new-uuid' }] });

      const result = await service.createTransactionStatus({
        text: 'win',
        value: 'W',
        colorCode: '#52c41a',
      });
      expect(result.data.id).toBe('new-uuid');
    });
  });

  describe('updateTransactionStatusById', () => {
    it('should update and return the updated row', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockResolvedValueOnce({ rows: [mockRow] }) // UPDATE
        .mockResolvedValueOnce(undefined); // COMMIT

      const result = await service.updateTransactionStatusById({
        id: 'uuid-1',
        text: 'win',
        value: 'W',
        colorCode: '#52c41a',
        isActive: true,
      });

      expect(result.data.id).toBe('uuid-1');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      mockClient.query
        .mockResolvedValueOnce(undefined) // BEGIN
        .mockRejectedValueOnce(new Error('DB error')); // UPDATE throws

      await expect(
        service.updateTransactionStatusById({
          id: 'uuid-1',
          text: 'win',
          value: 'W',
          colorCode: '#52c41a',
          isActive: true,
        }),
      ).rejects.toThrow('DB error');

      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateTransactionStatusActiveStatusById', () => {
    it('should update active status without returning a value', async () => {
      mockPool.query.mockResolvedValue({});

      const result = await service.updateTransactionStatusActiveStatusById({
        id: 'uuid-1',
        isActive: false,
      });
      expect(result).toBeUndefined();
    });
  });
});
