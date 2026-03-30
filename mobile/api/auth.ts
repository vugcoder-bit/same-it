import { apiClient } from './apiClient';
import * as Application from 'expo-application';
import { Platform } from 'react-native';

export interface LoginPayload {
    username: string;
    password?: string;
    deviceId?: string;
}

export interface AuthResponse {
    user: {
        id: number;
        username: string;
    };
    token: string;
    role: 'ADMIN' | 'USER';
}

export const getDeviceId = async (): Promise<string> => {
    try {
        if (Platform.OS === 'android') {
            return Application.getAndroidId() || 'unknown-android';
        } else if (Platform.OS === 'ios') {
            return (await Application.getIosIdForVendorAsync()) || 'unknown-ios';
        }
        return 'web-device';
    } catch {
        return 'unknown-device';
    }
};

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
    const deviceId = await getDeviceId();
    const response = await apiClient.post<any>('/auth/login', { ...data, deviceId });
    return response.data.data;
};

export const registerApi = async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    return response.data.data;
};
