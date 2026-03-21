import prisma from '../utils/prisma';

export const create = async (data: { name: string; imageUrl?: string }) => {
    return prisma.serviceCategory.create({
        data,
    });
};

export const getAll = async () => {
    return prisma.serviceCategory.findMany({
        include: { _count: { select: { services: true } } },
        orderBy: { name: 'asc' },
    });
};

export const getById = async (id: number) => {
    return prisma.serviceCategory.findUnique({
        where: { id },
        include: { services: true },
    });
};

export const update = async (id: number, data: Partial<{ name: string; imageUrl: string }>) => {
    return prisma.serviceCategory.update({
        where: { id },
        data,
    });
};

export const remove = async (id: number) => {
    return prisma.serviceCategory.delete({
        where: { id },
    });
};
