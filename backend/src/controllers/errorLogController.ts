import { Request, Response, NextFunction } from 'express';
import * as errorLogService from '../services/errorLogService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await errorLogService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await errorLogService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await errorLogService.update(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await errorLogService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Error log deleted' });
    } catch (error) {
        next(error);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { code } = req.query;
        if (!code) {
            res.status(400).json({ success: false, message: 'Query parameter "code" is required' });
            return;
        }
        const items = await errorLogService.search(code as string);
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};
