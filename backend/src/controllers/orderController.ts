import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as orderService from '../services/orderService';
import { OrderStatus } from '@prisma/client';
import prisma from '../utils/prisma';
import { sendPushNotification } from '../services/notificationService';

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

        // Notify all admins of new order
        const admins = await prisma.user.findMany({ where: { role: 'ADMIN' }, select: { pushToken: true } });
        const adminTokens = admins.map(a => a.pushToken);
        await sendPushNotification(
            adminTokens,
            '🛒 New Order Received',
            `Order #${order.id} has been placed. Tap to review.`,
            { orderId: order.id }
        );

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

        // Notify the user who placed this order
        const userWithToken = await prisma.user.findUnique({
            where: { id: order.userId },
            select: { pushToken: true, username: true }
        });

        if (userWithToken?.pushToken) {
            const statusLabels: Record<string, string> = {
                PROCESSING: '⏳ Processing',
                SUCCESSFUL: '✅ Completed',
                FAILED: '❌ Failed',
            };
            await sendPushNotification(
                [userWithToken.pushToken],
                `Order #${order.id} Update`,
                `Your order status changed to: ${statusLabels[status] || status}`,
                { orderId: order.id, status }
            );
        }

        res.json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
};
