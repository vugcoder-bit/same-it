import prisma from '../utils/prisma';
import { OrderStatus } from '@prisma/client';

interface CreateOrderData {
    userId: number;
    serviceId: number;
    paymentMethodId: number;
    quantity?: number;
    totalPrice: number;
    phone1: string;
    phone2?: string;
    telegramUsername?: string;
    serialNumber?: string;
    paymentScreenshot?: string;
    notes?: string;
}

export const create = async (data: CreateOrderData) => {
    return prisma.order.create({
        data: {
            userId: data.userId,
            serviceId: data.serviceId,
            paymentMethodId: data.paymentMethodId,
            quantity: data.quantity || 1,
            totalPrice: data.totalPrice,
            phone1: data.phone1,
            phone2: data.phone2 || null,
            telegramUsername: data.telegramUsername || null,
            serialNumber: data.serialNumber || null,
            paymentScreenshot: data.paymentScreenshot || null,
            notes: data.notes || null,
            status: 'PROCESSING',
        },
        include: { service: true, paymentMethod: true },
    });
};

export const getByUserId = async (userId: number) => {
    return prisma.order.findMany({
        where: { userId },
        include: { service: true },
        orderBy: { createdAt: 'desc' },
    });
};

export const getAll = async (filters?: { status?: OrderStatus; startDate?: string; endDate?: string }) => {
    const where: Record<string, unknown> = {};

    if (filters?.status) where.status = filters.status;
    if (filters?.startDate || filters?.endDate) {
        where.createdAt = {};
        if (filters?.startDate) (where.createdAt as Record<string, unknown>).gte = new Date(filters.startDate);
        if (filters?.endDate) (where.createdAt as Record<string, unknown>).lte = new Date(filters.endDate);
    }

    return prisma.order.findMany({
        where,
        include: { 
            service: { include: { category: true } }, 
            user: { select: { id: true, username: true } },
            paymentMethod: true 
        },
        orderBy: { createdAt: 'desc' },
    });
};

export const getById = async (id: number) => {
    return prisma.order.findUnique({
        where: { id },
        include: { 
            service: { include: { category: true } }, 
            user: { select: { id: true, username: true } },
            paymentMethod: true 
        },
    });
};

export const updateStatus = async (id: number, status: OrderStatus, adminNotes?: string, adminFileUrl?: string) => {
    return prisma.order.update({
        where: { id },
        data: { 
            status,
            ...(adminNotes !== undefined && { adminNotes }),
            ...(adminFileUrl !== undefined && { adminFileUrl }),
        },
        include: { service: true, user: { select: { id: true, username: true } } },
    });
};
