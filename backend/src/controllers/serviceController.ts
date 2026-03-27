import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/serviceService';
import { deleteUploadedFile } from '../utils/fileHelper';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = {
            categoryId: parseInt(req.body.categoryId),
            title: req.body.title,
            description: req.body.description,
            price: parseFloat(req.body.price),
            duration: req.body.duration,
            deliveryTime: req.body.deliveryTime,
            image: req.file ? `services/${req.file.filename}` : undefined,
            requiresSN: req.body.requiresSN === 'true' || req.body.requiresSN === true,
        };
        const item = await serviceService.create(data);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await serviceService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await serviceService.getById(parseInt(req.params.id as string));
        if (!item) {
            res.status(404).json({ success: false, message: 'Service not found' });
            return;
        }
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getByCategoryId = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await serviceService.getByCategoryId(parseInt(req.params.categoryId as string));
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: any = {};
        if (req.body.categoryId) data.categoryId = parseInt(req.body.categoryId);
        if (req.body.title) data.title = req.body.title;
        if (req.body.description) data.description = req.body.description;
        if (req.body.price) data.price = parseFloat(req.body.price);
        if (req.body.duration) data.duration = req.body.duration;
        if (req.body.deliveryTime) data.deliveryTime = req.body.deliveryTime;
        if (req.body.requiresSN !== undefined) data.requiresSN = req.body.requiresSN === 'true' || req.body.requiresSN === true;

        if (req.file) {
            // Delete old image from disk before saving the new one
            const existing = await serviceService.getById(parseInt(req.params.id as string));
            if (existing?.image) {
                deleteUploadedFile(existing.image);
            }
            data.image = `services/${req.file.filename}`;
        }

        const item = await serviceService.update(parseInt(req.params.id as string), data);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await serviceService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Service deleted' });
    } catch (error) {
        next(error);
    }
};
