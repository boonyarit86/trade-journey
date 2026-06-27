import Axios from "axios";
import { APP_API_URL } from "../../../constants";
import type { IProject, IProjectForm } from "../types";

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
        return;
    } catch (error) {
        throw error;
    }
};

export const updateProjectById = async (dataUpdated: IProjectForm) => {
    try {
        await Axios.put(`${APP_API_URL}/project`, { ...dataUpdated });
        return;
    } catch (error) {
        throw error;
    }
};

export const createProject = async (data: IProjectForm) => {
    try {
        const res = await Axios.post(`${APP_API_URL}/project`, { ...data });
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};

export const deleteProjectById = async (id: string) => {
    try {
        const res = await Axios.delete(`${APP_API_URL}/project/${id}`);
        return res.data?.data?.id;
    } catch (error) {
        throw error;
    }
};