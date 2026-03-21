import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as dashboardService from '../services/dashboardService';

export const getStats = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
};
