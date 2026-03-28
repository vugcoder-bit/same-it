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
