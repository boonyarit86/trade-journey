import { Test, TestingModule } from '@nestjs/testing';
import { readdir, readFile } from 'fs/promises';
import { PgService } from 'src/database/pg.service';
import { MigrationService } from './migration.service';

jest.mock('fs/promises', () => ({
    readdir: jest.fn(),
    readFile: jest.fn(),
}));

describe('MigrationService', () => {
    let service: MigrationService;
    let query: jest.Mock;
    let connect: jest.Mock;
    let clientQuery: jest.Mock;
    let release: jest.Mock;

    beforeEach(async () => {
        query = jest.fn();
        clientQuery = jest.fn();
        release = jest.fn();
        connect = jest.fn().mockResolvedValue({
            query: clientQuery,
            release,
        });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MigrationService,
                {
                    provide: PgService,
                    useValue: {
                        getPool: () => ({ query, connect }),
                    },
                },
            ],
        }).compile();

        service = module.get<MigrationService>(MigrationService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('runs only pending migrations in order and records each one', async () => {
        query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        (readdir as jest.Mock).mockResolvedValue([
            '2_second.sql',
            '1_first.sql',
            'readme.txt',
        ]);
        (readFile as jest.Mock)
            .mockResolvedValueOnce('SQL 1')
            .mockResolvedValueOnce('SQL 2');

        clientQuery.mockResolvedValue({});

        const result = await service.runMigrations();

        expect(result.applied).toEqual(['1_first.sql', '2_second.sql']);
        expect(result.skipped).toEqual([]);
        expect(readFile).toHaveBeenNthCalledWith(
            1,
            expect.stringContaining('1_first.sql'),
            'utf-8',
        );
        expect(readFile).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('2_second.sql'),
            'utf-8',
        );
        expect(clientQuery).toHaveBeenCalledWith('BEGIN');
        expect(clientQuery).toHaveBeenCalledWith('SQL 1');
        expect(clientQuery).toHaveBeenCalledWith(
            'INSERT INTO "public"."schema_migrations" ("name") VALUES ($1)',
            ['1_first.sql'],
        );
        expect(clientQuery).toHaveBeenCalledWith('COMMIT');
        expect(release).toHaveBeenCalledTimes(2);
    });

    it('skips already applied migrations', async () => {
        query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({
                rows: [{ name: '1_first.sql' }, { name: '2_second.sql' }],
            });

        (readdir as jest.Mock).mockResolvedValue(['1_first.sql', '2_second.sql']);

        const result = await service.runMigrations();

        expect(result.applied).toEqual([]);
        expect(result.skipped).toEqual(['1_first.sql', '2_second.sql']);
        expect(connect).not.toHaveBeenCalled();
    });

    it('rolls back and rethrows when a migration fails', async () => {
        query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        (readdir as jest.Mock).mockResolvedValue(['1_first.sql']);
        (readFile as jest.Mock).mockResolvedValue('SQL 1');
        clientQuery
            .mockResolvedValueOnce({})
            .mockRejectedValueOnce(new Error('SQL error'))
            .mockResolvedValue({});

        await expect(service.runMigrations()).rejects.toThrow('SQL error');
        expect(clientQuery).toHaveBeenCalledWith('ROLLBACK');
        expect(release).toHaveBeenCalled();
    });
});
