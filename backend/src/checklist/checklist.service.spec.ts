import { Test, TestingModule } from '@nestjs/testing';
import { PgService } from 'src/database/pg.service';
import { ChecklistService } from './checklist.service';

describe('ChecklistService', () => {
  let service: ChecklistService;
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
        ChecklistService,
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

    service = module.get<ChecklistService>(ChecklistService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllChecklists', () => {
    it('should return all checklists', async () => {
      const mockRows = [
        {
          TD02_Id: '1',
          TD02_Name: 'Without emotional',
          TD02_IsRequired: false,
          TD02_IsActive: true,
          TD02_CreatedBy: 'admin',
          TD02_CreatedAt: new Date(),
          TD02_ModifiedBy: 'admin',
          TD02_ModifiedAt: new Date(),
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows, rowCount: 1 });

      const result = await service.getAllChecklists();

      expect(result.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].name).toBe('Without emotional');
      expect(result.data[0].isRequired).toBe(false);
    });
  });

  describe('getChecklistById', () => {
    it('should return single checklist by id', async () => {
      const mockRows = [
        {
          TD02_Id: '1',
          TD02_Name: 'Without emotional',
          TD02_IsRequired: false,
          TD02_IsActive: true,
          TD02_CreatedBy: 'admin',
          TD02_CreatedAt: new Date(),
          TD02_ModifiedBy: 'admin',
          TD02_ModifiedAt: new Date(),
        },
      ];
      mockQuery.mockResolvedValue({ rows: mockRows });

      const result = await service.getChecklistById('1');

      expect(result.data.id).toBe('1');
      expect(result.data.name).toBe('Without emotional');
    });

    it('should throw error if checklist not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      await expect(service.getChecklistById('999')).rejects.toThrow('Not found any checklist');
    });
  });

  describe('createChecklist', () => {
    it('should create a new checklist', async () => {
      const mockDto = { name: 'Without emotional' };
      mockQuery.mockResolvedValue({ rows: [{ TD02_Id: '1' }] });

      const result = await service.createChecklist(mockDto);

      expect(result.data.id).toBe('1');
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('updateChecklistById', () => {
    it('should update checklist with transaction', async () => {
      const mockDto = { id: '1', name: 'Without emotional', isRequired: true, isActive: true };
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockResolvedValueOnce({
          rows: [{ TD02_Id: '1', TD02_Name: 'Without emotional', TD02_IsRequired: true, TD02_IsActive: true, TD02_ModifiedAt: new Date() }],
        })
        .mockResolvedValueOnce(undefined);

      const result = await service.updateChecklistById(mockDto);

      expect(result.data.id).toBe('1');
      expect(result.data.isRequired).toBe(true);
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should rollback on error', async () => {
      const mockDto = { id: '1', name: 'Without emotional', isRequired: true, isActive: true };
      mockClient.query
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Database error'));

      await expect(service.updateChecklistById(mockDto)).rejects.toThrow();
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('updateChecklistActiveStatusById', () => {
    it('should update checklist active status', async () => {
      const mockDto = { id: '1', isActive: false };
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await service.updateChecklistActiveStatusById(mockDto);

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalled();
    });
  });

  describe('deleteChecklistById', () => {
    it('should delete checklist by id', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await service.deleteChecklistById('1');

      expect(result).toBeUndefined();
      expect(mockQuery).toHaveBeenCalled();
    });
  });
});
