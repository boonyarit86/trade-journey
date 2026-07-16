import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { IStrategy, IStrategyForm } from "../types";

export const fetchStrategies = async (): Promise<IStrategy[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/strategy`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const fetchStrategyById = async (id: string): Promise<IStrategy> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/strategy/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error;
    }
};

export const createStrategy = async (
    data: Omit<IStrategyForm, 'id' | 'isActive' | 'checklistIds'>
): Promise<string> => {
    try {
        const res = await Axios.post(`${APP_API_URL}/strategy`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const updateStrategyById = async (data: IStrategyForm): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/strategy`, { ...data });
        return;
    } catch (error) {
        throw error;
    }
};

export const updateStrategyActiveStatusById = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/strategy/activeStatus`, { id, isActive });
        return;
    } catch (error) {
        throw error;
    }
};

export const deleteStrategyById = async (id: string): Promise<void> => {
    try {
        await Axios.delete(`${APP_API_URL}/strategy/${id}`);
        return;
    } catch (error) {
        throw error;
    }
};
