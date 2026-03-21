import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';

export const createUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const users = await userService.getUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = await userService.updateUser(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await userService.deleteUser(parseInt(req.params.id as string));
        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};
