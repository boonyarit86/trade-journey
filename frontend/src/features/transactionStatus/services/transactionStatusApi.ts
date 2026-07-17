import Axios from 'axios';
import { APP_API_URL } from '../../../constants';
import type { ITransactionStatus, ITransactionStatusForm } from '../types';

export const fetchTransactionStatuses = async (): Promise<ITransactionStatus[]> => {
    const res = await Axios.get(`${APP_API_URL}/transaction-status`);
    return res.data?.data || [];
};

export const fetchTransactionStatusById = async (id: string): Promise<ITransactionStatus> => {
    const res = await Axios.get(`${APP_API_URL}/transaction-status/${id}`);
    return res.data?.data;
};

export const createTransactionStatus = async (
    data: Pick<ITransactionStatusForm, 'text' | 'value' | 'colorCode'>,
): Promise<string> => {
    const res = await Axios.post(`${APP_API_URL}/transaction-status`, data);
    return res.data?.data?.id;
};

export const updateTransactionStatus = async (data: ITransactionStatusForm): Promise<void> => {
    await Axios.put(`${APP_API_URL}/transaction-status`, data);
};

export const updateTransactionStatusActiveStatus = async (
    id: string,
    isActive: boolean,
): Promise<void> => {
    await Axios.put(`${APP_API_URL}/transaction-status/activeStatus`, { id, isActive });
};
