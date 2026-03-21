import { apiClient } from './apiClient';

export interface LoginPayload {
    username: string;
    password?: string;
}

export interface AuthResponse {
    user: {
        id: number;
        username: string;
    };
    token: string;
    role: 'ADMIN' | 'USER';
}

export const loginApi = async (data: LoginPayload): Promise<AuthResponse> => {
    // Replace with actual endpoint later
    const response = await apiClient.post<any>('/auth/login', data);
    return response.data.data;
};

export const registerApi = async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post<any>('/auth/register', data);
    return response.data.data;
};
