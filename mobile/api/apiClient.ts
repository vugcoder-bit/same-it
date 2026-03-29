import axios from 'axios';
import { Alert } from 'react-native';

import { useAuthStore } from '../store/authStore';

// Define the base URL for the backend
const API_URL = __DEV__ ? "http://192.168.1.171:3000/api" : process.env.EXPO_PUBLIC_API_URL || 'http://46.225.230.167:3000/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically inject JWT Token from Zustand Store persistence
apiClient.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const message = error.response?.data?.message || '';
            if (message.includes('Subscription expired')) {
                Alert.alert(
                    'Subscription Expired',
                    'Your subscription has expired. Please renew to continue using the app.',
                    [{ text: 'OK', onPress: () => useAuthStore.getState().logout() }]
                );
            } else {
                useAuthStore.getState().logout();
            }
        }
        return Promise.reject(error);
    }
);
