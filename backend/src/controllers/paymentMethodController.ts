import { Request, Response, NextFunction } from 'express';
import * as paymentMethodService from '../services/paymentMethodService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await paymentMethodService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await paymentMethodService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await paymentMethodService.update(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await paymentMethodService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Payment method deleted' });
    } catch (error) {
        next(error);
    }
};
