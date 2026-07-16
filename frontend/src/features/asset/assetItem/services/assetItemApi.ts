import Axios from "axios";
import { APP_API_URL } from "../../../../constants";
import type { IAsset, IAssetForm } from "../types";

export const fetchAssets = async (): Promise<IAsset[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/asset`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const fetchAssetById = async (id: string): Promise<IAsset> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/asset/${id}`);
        return res.data?.data;
    } catch (error) {
        throw error;
    }
};

export const updateAssetActiveStatusById = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/asset/activeStatus`, { id, isActive });
        return;
    } catch (error) {
        throw error;
    }
};

export const updateAssetById = async (dataUpdated: IAssetForm) => {
    try {
        await Axios.put(`${APP_API_URL}/asset`, { ...dataUpdated });
        return;
    } catch (error) {
        throw error;
    }
};

export const createAsset = async (data: Omit<IAssetForm, 'id' | 'isActive'>) => {
    try {
        const res = await Axios.post(`${APP_API_URL}/asset`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const deleteAssetById = async (id: string) => {
    try {
        const res = await Axios.delete(`${APP_API_URL}/asset/${id}`);
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};
