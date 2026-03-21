import { apiClient } from './apiClient';

export interface DashboardStats {
    totalUsers: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    recentOrders: Array<{
        id: number;
        userId: number;
        status: string;
        createdAt: string;
        user: { username: string };
        service: { title: string };
    }>;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data.data;
};
