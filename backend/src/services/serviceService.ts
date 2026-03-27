import prisma from '../utils/prisma';

interface ServiceData {
    categoryId: number;
    title: string;
    description: string;
    price: number;
    duration?: string;
    deliveryTime?: string;
    image?: string;
    requiresSN?: boolean;
}

export const create = async (data: ServiceData) => {
    return prisma.service.create({
        data: {
            categoryId: data.categoryId,
            title: data.title,
            description: data.description,
            price: data.price,
            duration: data.duration || null,
            deliveryTime: data.deliveryTime || null,
            image: data.image || null,
            requiresSN: data.requiresSN || false,
        },
    });
};

export const getAll = async () => {
    return prisma.service.findMany({
        where: { isDeleted: false },
        include: { category: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
    });
};

export const getByCategoryId = async (categoryId: number) => {
    return prisma.service.findMany({
        where: { categoryId, isDeleted: false },
        orderBy: { title: 'asc' },
    });
};

export const getById = async (id: number) => {
    return prisma.service.findUnique({ where: { id } });
};

export const update = async (id: number, data: Partial<ServiceData>) => {
    return prisma.service.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    return prisma.service.update({ where: { id }, data: { isDeleted: true } });
};
