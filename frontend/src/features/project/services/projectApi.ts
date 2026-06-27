import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { IProject } from "../types";

export const fetchProjects = async (): Promise<IProject[]> => {
    try {
        const res = await Axios.get(`${APP_API_URL}/project`);
        return res.data?.data || [];
    } catch (error) {
        throw error;
    }
};

export const updateProjectActiveStatus = async (id: string, isActive: boolean): Promise<void> => {
    try {
        await Axios.put(`${APP_API_URL}/project/activeStatus`, { id, isActive });
    } catch (error) {
        throw error;
    }
};