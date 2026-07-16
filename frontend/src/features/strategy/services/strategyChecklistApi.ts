import Axios from "axios";
import { APP_API_URL } from "../../../constants";

export const createStrategyChecklist = async (strategyId: string, checklistId: string): Promise<void> => {
    try {
        await Axios.post(`${APP_API_URL}/strategy-checklist`, { strategyId, checklistId });
        return;
    } catch (error) {
        throw error;
    }
};

export const deleteStrategyChecklist = async (strategyId: string, checklistId: string): Promise<void> => {
    try {
        await Axios.delete(`${APP_API_URL}/strategy-checklist/${strategyId}/${checklistId}`);
        return;
    } catch (error) {
        throw error;
    }
};
