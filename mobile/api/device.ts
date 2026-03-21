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
    _count?: {
        models: number;
    };
}

export interface DeviceModel {
    id: number;
    name: string;
    deviceId: number;
    device?: Device;
}

export const getDevices = async (params?: { deviceTypeId?: number }): Promise<Device[]> => {
    const response = await apiClient.get('/devices', { params });
    return response.data.data;
};

export const getDeviceTypes = async (): Promise<DeviceType[]> => {
    const response = await apiClient.get('/device-types');
    return response.data.data;
};

export const getDeviceModelsByBrandId = async (brandId: number): Promise<DeviceModel[]> => {
    // Get all devices for this brand, then collect all their models
    const devicesRes = await apiClient.get('/devices', { params: { deviceTypeId: brandId } });
    const devices: Device[] = devicesRes.data.data || [];
    const modelRequests = devices.map((d: Device) =>
        apiClient.get('/device-models', { params: { deviceId: d.id } }).then(r => r.data.data || [])
    );
    const modelArrays = await Promise.all(modelRequests);
    const allModels = modelArrays.flat();
    
    // Filter out duplicates by model ID
    const uniqueMap = new Map();
    allModels.forEach(m => uniqueMap.set(m.id, m));
    return Array.from(uniqueMap.values());
};
