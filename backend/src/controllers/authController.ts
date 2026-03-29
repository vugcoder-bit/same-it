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
        const { pushToken } = req.body;
        const userId = (req as any).user.id;
        if (!pushToken) {
            res.status(400).json({ success: false, message: 'Push token is required' });
            return;
        }
        await authService.updatePushToken(userId, pushToken);
        res.json({ success: true, message: 'Push token updated successfully' });
    } catch (error) {
        next(error);
    }
};
