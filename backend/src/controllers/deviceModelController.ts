import { Request, Response, NextFunction } from 'express';
import * as deviceModelService from '../services/deviceModelService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await deviceModelService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters: any = {};
        if (req.query.deviceId) filters.deviceId = parseInt(req.query.deviceId as string);

        const items = await deviceModelService.getAll(filters);
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getByDeviceId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await deviceModelService.getByDeviceId(parseInt(req.params.deviceId as string));
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await deviceModelService.getById(parseInt(req.params.id as string));
        if (!item) {
            res.status(404).json({ success: false, message: 'Device model not found' });
            return;
        }
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await deviceModelService.update(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await deviceModelService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Device model deleted' });
    } catch (error) {
        next(error);
    }
};
