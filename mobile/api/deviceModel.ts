import { apiClient } from './apiClient';

export interface DeviceModel {
    id: number;
    deviceId: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export const getDeviceModelsByDeviceId = async (deviceId: number): Promise<DeviceModel[]> => {
    const response = await apiClient.get(`/device-models/device/${deviceId}`);
    return response.data.data;
};
