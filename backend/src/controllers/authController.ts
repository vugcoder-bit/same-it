import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/authService';

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { username, password, deviceId } = req.body;
        const result = await authService.login(username, password, deviceId);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const updatePushToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { pushToken, deviceId } = req.body;
        const userId = (req as any).user.id;
        
        if (!pushToken && !deviceId) {
            res.status(400).json({ success: false, message: 'Push token or Device ID is required' });
            return;
        }
        
        await authService.updatePushToken(userId, pushToken, deviceId);
        res.json({ success: true, message: 'Device metadata updated successfully' });
    } catch (error) {
        next(error);
    }
};
