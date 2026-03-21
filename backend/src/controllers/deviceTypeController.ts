import { Request, Response, NextFunction } from 'express';
import * as deviceTypeService from '../services/deviceTypeService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageUrl = `brands/${req.file.filename}`;
        }
        const item = await deviceTypeService.create(data);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await deviceTypeService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await deviceTypeService.getById(parseInt(req.params.id as string));
        if (!item) {
            res.status(404).json({ success: false, message: 'Device Type not found' });
            return;
        }
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageUrl = `brands/${req.file.filename}`;
        }
        const item = await deviceTypeService.update(parseInt(req.params.id as string), data);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await deviceTypeService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Device Type deleted' });
    } catch (error) {
        next(error);
    }
};
