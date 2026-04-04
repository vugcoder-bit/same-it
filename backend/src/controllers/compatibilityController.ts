import { Request, Response, NextFunction } from 'express';
import * as compatibilityService from '../services/compatibilityService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await compatibilityService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await compatibilityService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await compatibilityService.update(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await compatibilityService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Compatibility entry deleted' });
    } catch (error) {
        next(error);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { deviceId, type, brandId, query, subCategoryId } = req.query;
        const parsedDeviceId = deviceId ? parseInt(deviceId as string) : undefined;
        const parsedBrandId = brandId ? parseInt(brandId as string) : undefined;
        const parsedSubCatId = subCategoryId ? parseInt(subCategoryId as string) : undefined;
        const items = await compatibilityService.search(
            parsedDeviceId,
            type as string,
            parsedBrandId,
            query as string | undefined,
            parsedSubCatId
        );
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};
