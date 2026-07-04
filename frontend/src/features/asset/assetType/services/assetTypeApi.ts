import Axios from "axios";
import { APP_API_URL } from "../../../../constants";
import type { IAssetType, IAssetTypeForm } from "../types";

export const fetchAssetTypes = async (): Promise<IAssetType[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/asset/type`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const updateAssetTypeActiveStatusById = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/asset/type/activeStatus`, { id, isActive });
        return;
    } catch (error) {
        throw error;
    }
};

export const updateAssetTypeById = async (dataUpdated: IAssetTypeForm) => {
    try {
        await Axios.put(`${APP_API_URL}/asset/type`, { ...dataUpdated });
        return;
    } catch (error) {
        throw error;
    }
};

export const createAssetType = async (data: IAssetTypeForm) => {
    try {
        const res = await Axios.post(`${APP_API_URL}/asset/type`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const deleteAssetTypeById = async (id: string) => {
    try {
        const res = await Axios.delete(`${APP_API_URL}/asset/type/${id}`);
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};