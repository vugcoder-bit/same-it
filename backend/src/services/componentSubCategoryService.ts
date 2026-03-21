import prisma from '../utils/prisma';
import { ComponentType } from '@prisma/client';

export const getAll = async () => {
    return prisma.componentSubCategory.findMany({ orderBy: { componentType: 'asc' } });
};

export const getByComponentType = async (type: ComponentType) => {
    return prisma.componentSubCategory.findMany({
        where: { componentType: type },
        orderBy: { name: 'asc' },
    });
};

export const create = async (data: { componentType: string; name: string; imageUrl?: string }) => {
    return prisma.componentSubCategory.create({
        data: {
            componentType: data.componentType.toUpperCase() as ComponentType,
            name: data.name,
            imageUrl: data.imageUrl,
        },
    });
};

export const update = async (id: number, data: { name?: string; imageUrl?: string }) => {
    return prisma.componentSubCategory.update({
        where: { id },
        data,
    });
};

export const remove = async (id: number) => {
    return prisma.componentSubCategory.delete({ where: { id } });
};
