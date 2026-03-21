import { Request, Response, NextFunction } from 'express';
import * as serviceCategoryService from '../services/serviceCategoryService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = {
            name: req.body.name,
            imageUrl: req.file ? `services/${req.file.filename}` : undefined,
        };
        const item = await serviceCategoryService.create(data);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await serviceCategoryService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await serviceCategoryService.getById(parseInt(req.params.id as string));
        if (!item) {
             res.status(404).json({ success: false, message: 'Category not found' });
             return;
        }
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data: any = {};
        if (req.body.name) data.name = req.body.name;
        if (req.file) data.imageUrl = `services/${req.file.filename}`;

        const item = await serviceCategoryService.update(parseInt(req.params.id as string), data);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await serviceCategoryService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        next(error);
    }
};
