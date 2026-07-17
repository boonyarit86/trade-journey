import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { ITransaction, ITransactionForm } from "../types";

export const fetchTransactions = async (portfolioId?: string): Promise<ITransaction[]> => {
    try {
        const url = portfolioId
            ? `${APP_API_URL}/transaction?portfolioId=${portfolioId}`
            : `${APP_API_URL}/transaction`;
        const res = await Axios.get(url);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const fetchTransactionById = async (id: string): Promise<ITransaction> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/transaction/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error;
    }
};

export const createTransaction = async (data: ITransactionForm): Promise<string> => {
    try {
        const res = await Axios.post(`${APP_API_URL}/transaction`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};
