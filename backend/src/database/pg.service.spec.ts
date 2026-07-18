import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from './pg.service';
import * as pgConnection from './pg-connection';

jest.mock('./pg-connection');

describe('PgService', () => {
    let service: PgService;
    let mockPool: any;

    beforeEach(async () => {
        const errorHandlers: ((err: Error) => void)[] = [];
        mockPool = {
            end: jest.fn().mockResolvedValue(undefined),
            on: jest.fn().mockImplementation((event: string, handler: (err: Error) => void) => {
                if (event === 'error') errorHandlers.push(handler);
            }),
            _errorHandlers: errorHandlers,
        };

        jest.spyOn(pgConnection, 'connectPg').mockResolvedValue(mockPool);

        const module: TestingModule = await Test.createTestingModule({
            providers: [PgService],
        }).compile();

        service = module.get<PgService>(PgService);
        await service.onModuleInit();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should connect to the database on init', () => {
        expect(pgConnection.connectPg).toHaveBeenCalled();
    });

    it('should return the pool from getPool()', () => {
        expect(service.getPool()).toBe(mockPool);
    });

    it('should register an error handler on the pool', () => {
        expect(mockPool.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should not throw when the pool emits an error (prevents crash)', () => {
        const errorHandler = mockPool._errorHandlers[0];
        expect(() => errorHandler(new Error('Connection terminated unexpectedly'))).not.toThrow();
    });

    it('should end the pool on destroy', async () => {
        await service.onModuleDestroy();
        expect(mockPool.end).toHaveBeenCalled();
    });
});
