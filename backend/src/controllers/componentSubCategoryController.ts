import { Request, Response, NextFunction } from 'express';
import * as service from '../services/componentSubCategoryService';

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await service.getAll();
        res.json({ success: true, data: items });
    } catch (error) { next(error); }
};

export const getByType = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { type } = req.params;
        const items = await service.getByComponentType((req.params.type as string).toUpperCase() as any);
        res.json({ success: true, data: items });
    } catch (error) { next(error); }
};

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { componentType, name } = req.body;
        const imageUrl = req.file ? `components/${req.file.filename}` : undefined;
        const item = await service.create({ componentType, name, imageUrl });
        res.status(201).json({ success: true, data: item });
    } catch (error) { next(error); }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = parseInt(req.params.id as string);
        const { name } = req.body;
        const imageUrl = req.file ? `components/${req.file.filename}` : undefined;
        const updateData: any = {};
        if (name) updateData.name = name;
        if (imageUrl) updateData.imageUrl = imageUrl;
        const item = await service.update(id, updateData);
        res.json({ success: true, data: item });
    } catch (error) { next(error); }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await service.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Sub-category deleted' });
    } catch (error) { next(error); }
};
