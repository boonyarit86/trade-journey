import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { IChecklist, IChecklistForm } from "../types";

export const fetchChecklists = async (): Promise<IChecklist[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/checklist`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const fetchChecklistById = async (id: string): Promise<IChecklist> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/checklist/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error;
    }
};

export const updateChecklistActiveStatusById = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/checklist/activeStatus`, { id, isActive });
        return;
    } catch (error) {
        throw error;
    }
};

export const updateChecklistById = async (dataUpdated: IChecklistForm) => {
    try {
        await Axios.put(`${APP_API_URL}/checklist`, { ...dataUpdated });
        return;
    } catch (error) {
        throw error;
    }
};

export const createChecklist = async (data: Omit<IChecklistForm, 'id' | 'isActive'>) => {
    try {
        const res = await Axios.post(`${APP_API_URL}/checklist`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const deleteChecklistById = async (id: string) => {
    try {
        const res = await Axios.delete(`${APP_API_URL}/checklist/${id}`);
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};
