import { apiClient } from './apiClient';

export interface DeviceType {
    id: number;
    name: string;
    imageUrl: string | null;
}

export interface Device {
    id: number;
    name: string;
    imageUrl: string | null;
    deviceTypeId: number | null;
    deviceType?: DeviceType;
    createdAt: string;
    updatedAt: string;
}

export const getDevices = async (params?: { deviceTypeId?: number }): Promise<Device[]> => {
    const response = await apiClient.get('/devices', { params });
    return response.data.data;
};

export const getDeviceTypes = async (): Promise<DeviceType[]> => {
    const response = await apiClient.get('/device-types');
    return response.data.data;
};
