import { apiClient } from './apiClient';

export interface Compatibility {
    id: number;
    componentType: string;
    deviceId?: number;
    subCategoryId?: number;
    compatibleModels: string[] | string;
    device?: {
        id: number;
        name: string;
    };
    subCategory?: {
        id: number;
        name: string;
    };
}

export const searchCompatibility = async (params: {
    type: string;
    deviceId?: number;
    subCategoryId?: number;
    brandId?: number;
    query?: string;
}): Promise<Compatibility[]> => {
    const response = await apiClient.get('/compatibility/search', { params });
    return response.data.data;
};
