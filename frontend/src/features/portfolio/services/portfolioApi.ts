import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { IPortfolio, IPortfolioForm } from "../types";

export const fetchPortfolios = async (): Promise<IPortfolio[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/portfolio`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const fetchPortfolioById = async (id: string): Promise<IPortfolio> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/portfolio/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error;
    }
};

export const createPortfolio = async (
    data: Omit<IPortfolioForm, 'id' | 'isActive'>
): Promise<string> => {
    try {
        const res = await Axios.post(`${APP_API_URL}/portfolio`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const updatePortfolioById = async (data: IPortfolioForm): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/portfolio`, { ...data });
        return;
    } catch (error) {
        throw error;
    }
};

export const updatePortfolioActiveStatusById = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/portfolio/activeStatus`, { id, isActive });
        return;
    } catch (error) {
        throw error;
    }
};

export const deletePortfolioById = async (id: string): Promise<void> => {
    try {
        await Axios.delete(`${APP_API_URL}/portfolio/${id}`);
        return;
    } catch (error) {
        throw error;
    }
};
