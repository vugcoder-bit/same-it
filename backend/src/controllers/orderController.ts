import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as orderService from '../services/orderService';
import { OrderStatus } from '@prisma/client';

export const create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = {
            userId: req.user!.id,
            serviceId: parseInt(req.body.serviceId),
            paymentMethodId: parseInt(req.body.paymentMethodId),
            quantity: req.body.quantity ? parseInt(req.body.quantity) : 1,
            totalPrice: parseFloat(req.body.totalPrice),
            phone1: req.body.phone1,
            phone2: req.body.phone2 || undefined,
            telegramUsername: req.body.telegramUsername || undefined,
            serialNumber: req.body.serialNumber || undefined,
            paymentScreenshot: req.file ? req.file.filename : undefined,
            notes: req.body.notes || undefined,
        };
        const order = await orderService.create(data);
        res.status(201).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const orders = await orderService.getByUserId(req.user!.id);
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const getAllOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters = {
            status: req.query.status as OrderStatus | undefined,
            startDate: req.query.startDate as string | undefined,
            endDate: req.query.endDate as string | undefined,
        };
        const orders = await orderService.getAll(filters);
        res.json({ success: true, data: orders });
    } catch (error) {
        next(error);
    }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { status, adminNotes } = req.body;
        if (!['PROCESSING', 'FAILED', 'SUCCESSFUL'].includes(status)) {
            res.status(400).json({ success: false, message: 'Invalid status. Must be PROCESSING, FAILED, or SUCCESSFUL.' });
            return;
        }
        
        let adminFileUrl: string | undefined = undefined;
        if (req.file) {
            const baseUrl = req.protocol + '://' + req.get('host');
            adminFileUrl = `${baseUrl}/uploads/admin-files/${req.file.filename}`;
        }
        
        const order = await orderService.updateStatus(parseInt(req.params.id as string), status as OrderStatus, adminNotes, adminFileUrl);
        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
