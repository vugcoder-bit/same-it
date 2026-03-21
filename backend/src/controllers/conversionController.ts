import { Request, Response, NextFunction } from 'express';
import * as conversionService from '../services/conversionService';

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await conversionService.create(req.body);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await conversionService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const item = await conversionService.update(parseInt(req.params.id as string), req.body);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await conversionService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Conversion rule deleted' });
    } catch (error) {
        next(error);
    }
};

export const convertText = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { text, mode } = req.body;
        if (!text) {
            res.status(400).json({ success: false, message: '"text" field is required' });
            return;
        }
        if (!mode || !['toHex', 'toText'].includes(mode)) {
            res.status(400).json({ success: false, message: '"mode" must be "toHex" or "toText"' });
            return;
        }
        const { converted } = await conversionService.convertText(text, mode);
        res.json({ success: true, data: { original: text, converted } });
    } catch (error: any) {
        if (error.message === 'INVALID_HEX') {
            res.status(400).json({ success: false, message: 'Invalid hex format. Please enter valid hex characters (0-9, A-F).' });
            return;
        }
        next(error);
    }
};
