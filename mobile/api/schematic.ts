import { apiClient } from './apiClient';

export interface Schematic {
    id: number;
    deviceId: number;
    schematicType: string;
    pdfFile: string;
    uploadedAt: string;
    updatedAt: string;
}

export const getSchematicsByDevice = async (deviceId: number): Promise<Schematic[]> => {
    const response = await apiClient.get(`/schematics?deviceId=${deviceId}`);
    return response.data.data;
};

export const generateTempPdfUrl = async (schematicId: number): Promise<string> => {
    const response = await apiClient.get(`/schematics/${schematicId}/generate-url`);
    // Assuming backend is hosted on API_URL stripped endpoint, we map to actual hostname.
    const baseUrl = apiClient.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${response.data.data.url}`;
};
