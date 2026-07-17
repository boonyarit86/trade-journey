import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

describe('TransactionController', () => {
    let controller: TransactionController;
    let service: TransactionService;

    const mockTransactionService = {
        getAllTransactions: jest.fn(),
        getTransactionById: jest.fn(),
        createTransaction: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TransactionController],
            providers: [
                {
                    provide: TransactionService,
                    useValue: mockTransactionService,
                },
            ],
        }).compile();

        controller = module.get<TransactionController>(TransactionController);
        service = module.get<TransactionService>(TransactionService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should call getAllTransactions without filter', async () => {
        const mockResult = { total: 1, data: [] };
        mockTransactionService.getAllTransactions.mockResolvedValue(mockResult);

        const result = await controller.getAllTransactions();
        expect(service.getAllTransactions).toHaveBeenCalledWith(undefined);
        expect(result).toEqual(mockResult);
    });

    it('should call getAllTransactions with portfolioId filter', async () => {
        const mockResult = { total: 1, data: [] };
        mockTransactionService.getAllTransactions.mockResolvedValue(mockResult);

        const result = await controller.getAllTransactions('portfolio-1');
        expect(service.getAllTransactions).toHaveBeenCalledWith('portfolio-1');
        expect(result).toEqual(mockResult);
    });

    it('should call getTransactionById', async () => {
        const mockId = 'transaction-1';
        const mockResult = { data: { id: mockId, amount: 100 } };
        mockTransactionService.getTransactionById.mockResolvedValue(mockResult);

        const result = await controller.getTransactionById(mockId);
        expect(service.getTransactionById).toHaveBeenCalledWith(mockId);
        expect(result).toEqual(mockResult);
    });

    it('should call createTransaction', async () => {
        const mockDto = { portfolioId: 'portfolio-1', amount: 100, resultValue: 'W' };
        const mockResult = { data: { id: 'transaction-1' } };
        mockTransactionService.createTransaction.mockResolvedValue(mockResult);

        const result = await controller.createTransaction(mockDto);
        expect(service.createTransaction).toHaveBeenCalledWith(mockDto);
        expect(result).toEqual(mockResult);
    });
});
