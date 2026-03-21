import prisma from '../utils/prisma';

export const create = async (data: { title: string; accountNumber: string; color?: string; note?: string }) => {
    return prisma.paymentMethod.create({
        data,
    });
};

export const getAll = async () => {
    return prisma.paymentMethod.findMany({
        orderBy: { createdAt: 'asc' },
    });
};

export const getById = async (id: number) => {
    return prisma.paymentMethod.findUnique({
        where: { id },
    });
};

export const update = async (id: number, data: any) => {
    return prisma.paymentMethod.update({
        where: { id },
        data,
    });
};

export const remove = async (id: number) => {
    return prisma.paymentMethod.delete({
        where: { id },
    });
};
