import { Request, Response, NextFunction } from 'express';
import * as deviceService from '../services/deviceService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.imageUrl = `devices/${req.file.filename}`;
        }
        if (data.deviceTypeId) {
            data.deviceTypeId = parseInt(data.deviceTypeId);
        }
        const item = await deviceService.create(data);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters: any = {};
        if (req.query.deviceTypeId) filters.deviceTypeId = parseInt(req.query.deviceTypeId as string);
        
        const items = await deviceService.getAll(filters);
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await deviceService.getById(parseInt(req.params.id as string));
        if (!item) {
            res.status(404).json({ success: false, message: 'Device not found' });
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
            data.imageUrl = `devices/${req.file.filename}`;
        }
        if (data.deviceTypeId) {
            data.deviceTypeId = parseInt(data.deviceTypeId);
        }
        const item = await deviceService.update(parseInt(req.params.id as string), data);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await deviceService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Device deleted' });
    } catch (error) {
        next(error);
    }
};
