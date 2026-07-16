import { describe, it, expect, vi, beforeEach } from 'vitest';
import Axios from 'axios';
import {
    fetchChecklists,
    fetchChecklistById,
    createChecklist,
    updateChecklistById,
    updateChecklistActiveStatusById,
    deleteChecklistById,
} from '../services/checklistApi';
import { mockChecklists } from './mockData';

vi.mock('axios');

describe('checklistApi', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchChecklists', () => {
        it('should fetch all checklists', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockChecklists },
            });

            const result = await fetchChecklists();

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/checklist'));
            expect(result).toEqual(mockChecklists);
        });

        it('should return empty array if no data', async () => {
            vi.mocked(Axios.get).mockResolvedValue({
                data: {},
            });

            const result = await fetchChecklists();

            expect(result).toEqual([]);
        });
    });

    describe('fetchChecklistById', () => {
        it('should fetch a single checklist by id', async () => {
            const mockChecklist = mockChecklists[0];
            vi.mocked(Axios.get).mockResolvedValue({
                data: { data: mockChecklist },
            });

            const result = await fetchChecklistById('1');

            expect(Axios.get).toHaveBeenCalledWith(expect.stringContaining('/checklist/1'));
            expect(result).toEqual(mockChecklist);
        });
    });

    describe('createChecklist', () => {
        it('should create a new checklist', async () => {
            const newChecklistData = { name: 'New checklist item', isRequired: true };
            const mockId = 'new-checklist-id';
            vi.mocked(Axios.post).mockResolvedValue({
                data: { data: { id: mockId } },
            });

            const result = await createChecklist(newChecklistData);

            expect(Axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/checklist'),
                newChecklistData
            );
            expect(result).toEqual(mockId);
        });
    });

    describe('updateChecklistById', () => {
        it('should update a checklist', async () => {
            const updateData = {
                id: '1',
                name: 'Updated checklist',
                isRequired: true,
                isActive: true,
            };
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateChecklistById(updateData);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/checklist'),
                updateData
            );
        });
    });

    describe('updateChecklistActiveStatusById', () => {
        it('should update checklist active status', async () => {
            const id = '1';
            const isActive = false;
            vi.mocked(Axios.put).mockResolvedValue({ data: {} });

            await updateChecklistActiveStatusById(id, isActive);

            expect(Axios.put).toHaveBeenCalledWith(
                expect.stringContaining('/checklist/activeStatus'),
                { id, isActive }
            );
        });
    });

    describe('deleteChecklistById', () => {
        it('should delete a checklist', async () => {
            const id = '1';
            vi.mocked(Axios.delete).mockResolvedValue({ data: {} });

            await deleteChecklistById(id);

            expect(Axios.delete).toHaveBeenCalledWith(
                expect.stringContaining(`/checklist/${id}`)
            );
        });
    });
});
