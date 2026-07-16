import { Test, TestingModule } from '@nestjs/testing';
import { ChecklistController } from './checklist.controller';
import { ChecklistService } from './checklist.service';

describe('ChecklistController', () => {
  let controller: ChecklistController;
  let service: ChecklistService;

  const mockChecklistService = {
    getAllChecklists: jest.fn(),
    getChecklistById: jest.fn(),
    createChecklist: jest.fn(),
    updateChecklistById: jest.fn(),
    updateChecklistActiveStatusById: jest.fn(),
    deleteChecklistById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChecklistController],
      providers: [
        {
          provide: ChecklistService,
          useValue: mockChecklistService,
        },
      ],
    }).compile();

    controller = module.get<ChecklistController>(ChecklistController);
    service = module.get<ChecklistService>(ChecklistService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Checklist endpoints', () => {
    it('should call getAllChecklists', async () => {
      const mockResult = { total: 2, data: [] };
      mockChecklistService.getAllChecklists.mockResolvedValue(mockResult);

      const result = await controller.getAllChecklists();
      expect(service.getAllChecklists).toHaveBeenCalled();
      expect(result).toEqual(mockResult);
    });

    it('should call getChecklistById', async () => {
      const mockId = '123';
      const mockResult = { data: { id: mockId, name: 'Without emotional' } };
      mockChecklistService.getChecklistById.mockResolvedValue(mockResult);

      const result = await controller.getChecklistById(mockId);
      expect(service.getChecklistById).toHaveBeenCalledWith(mockId);
      expect(result).toEqual(mockResult);
    });

    it('should call createChecklist', async () => {
      const mockDto = { name: 'Without emotional' };
      const mockResult = { data: { id: '789' } };
      mockChecklistService.createChecklist.mockResolvedValue(mockResult);

      const result = await controller.createChecklist(mockDto);
      expect(service.createChecklist).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });

    it('should call updateChecklistById', async () => {
      const mockDto = { id: '123', name: 'Without emotional', isRequired: true, isActive: true };
      const mockResult = { data: { id: '123', name: 'Without emotional', isRequired: true, isActive: true, modifiedAt: new Date() } };
      mockChecklistService.updateChecklistById.mockResolvedValue(mockResult);

      const result = await controller.updateChecklistById(mockDto);
      expect(service.updateChecklistById).toHaveBeenCalledWith(mockDto);
      expect(result).toEqual(mockResult);
    });

    it('should call updateChecklistActiveStatusById', async () => {
      const mockDto = { id: '123', isActive: false };
      mockChecklistService.updateChecklistActiveStatusById.mockResolvedValue(undefined);

      const result = await controller.updateChecklistActiveStatusById(mockDto);
      expect(service.updateChecklistActiveStatusById).toHaveBeenCalledWith(mockDto);
      expect(result).toBeUndefined();
    });

    it('should call deleteChecklistById', async () => {
      const mockId = '123';
      mockChecklistService.deleteChecklistById.mockResolvedValue(undefined);

      const result = await controller.deleteChecklistById(mockId);
      expect(service.deleteChecklistById).toHaveBeenCalledWith(mockId);
      expect(result).toBeUndefined();
    });
  });
});
