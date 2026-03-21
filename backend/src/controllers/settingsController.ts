import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let settings = await (prisma as any).appSettings.findFirst();
        if (!settings) {
            settings = await (prisma as any).appSettings.create({
                data: { id: 1 }
            });
        }
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const settings = await (prisma as any).appSettings.upsert({
            where: { id: 1 },
            update: req.body,
            create: { id: 1, ...req.body }
        });
        res.json({ success: true, data: settings });
    } catch (error) {
        next(error);
    }
};
