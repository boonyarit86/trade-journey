import { Test, TestingModule } from '@nestjs/testing';
import { TransactionStatusController } from './transaction-status.controller';
import { TransactionStatusService } from './transaction-status.service';

describe('TransactionStatusController', () => {
  let controller: TransactionStatusController;
  let service: TransactionStatusService;

  const mockTransactionStatusService = {
    getAllTransactionStatuses: jest.fn(),
    getTransactionStatusById: jest.fn(),
    createTransactionStatus: jest.fn(),
    updateTransactionStatusById: jest.fn(),
    updateTransactionStatusActiveStatusById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionStatusController],
      providers: [
        {
          provide: TransactionStatusService,
          useValue: mockTransactionStatusService,
        },
      ],
    }).compile();

    controller = module.get<TransactionStatusController>(TransactionStatusController);
    service = module.get<TransactionStatusService>(TransactionStatusService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAllTransactionStatuses', () => {
    it('should return all transaction statuses', async () => {
      const mockResult = {
        total: 2,
        data: [
          { id: '1', text: 'win', value: 'W', colorCode: '#52c41a', isActive: true },
          { id: '2', text: 'loss', value: 'L', colorCode: '#ff4d4f', isActive: true },
        ],
      };
      mockTransactionStatusService.getAllTransactionStatuses.mockResolvedValue(mockResult);

      const result = await controller.getAllTransactionStatuses();
      expect(service.getAllTransactionStatuses).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });
  });

  describe('getTransactionStatusById', () => {
    it('should return a single transaction status', async () => {
      const mockId = 'uuid-1';
      const mockResult = {
        data: { id: mockId, text: 'win', value: 'W', colorCode: '#52c41a', isActive: true },
      };
      mockTransactionStatusService.getTransactionStatusById.mockResolvedValue(mockResult);

      const result = await controller.getTransactionStatusById(mockId);
      expect(service.getTransactionStatusById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockResult);
    });
  });

  describe('createTransactionStatus', () => {
    it('should create a transaction status and return the id', async () => {
      const mockDto = { text: 'win', value: 'W', colorCode: '#52c41a' };
      const mockResult = { data: { id: 'new-uuid' } };
      mockTransactionStatusService.createTransactionStatus.mockResolvedValue(mockResult);

      const result = await controller.createTransactionStatus(mockDto);
      expect(service.createTransactionStatus).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateTransactionStatusById', () => {
    it('should update and return the updated transaction status', async () => {
      const mockDto = { id: 'uuid-1', text: 'win', value: 'W', colorCode: '#52c41a', isActive: true };
      const mockResult = {
        data: { id: 'uuid-1', text: 'win', value: 'W', colorCode: '#52c41a', isActive: true, modifiedAt: new Date() },
      };
      mockTransactionStatusService.updateTransactionStatusById.mockResolvedValue(mockResult);

      const result = await controller.updateTransactionStatusById(mockDto);
      expect(service.updateTransactionStatusById).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('updateTransactionStatusActiveStatusById', () => {
    it('should toggle active status and return undefined', async () => {
      const mockDto = { id: 'uuid-1', isActive: false };
      mockTransactionStatusService.updateTransactionStatusActiveStatusById.mockResolvedValue(undefined);

      const result = await controller.updateTransactionStatusActiveStatusById(mockDto);
      expect(service.updateTransactionStatusActiveStatusById).toHaveBeenCalledWith(mockDto);
      expect(result).toBeUndefined();
    });
  });
});
