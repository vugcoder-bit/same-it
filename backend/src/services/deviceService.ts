import prisma from '../utils/prisma';

interface DeviceData {
    name: string;
    imageUrl?: string;
    deviceTypeId?: number;
}

export const create = async (data: DeviceData) => {
    return prisma.device.create({
        data,
    });
};

export const getAll = async (filters: { deviceTypeId?: number } = {}) => {
    const where: any = {};
    if (filters.deviceTypeId) where.deviceTypeId = filters.deviceTypeId;

    return (prisma.device as any).findMany({ 
        where,
        orderBy: { name: 'asc' },
        include: { deviceType: true }
    });
};

export const getById = async (id: number) => {
    return (prisma.device as any).findUnique({ 
        where: { id }, 
        include: { models: true, deviceType: true } 
    });
};

export const update = async (id: number, data: Partial<DeviceData>) => {
    return prisma.device.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    return prisma.device.delete({ where: { id } });
};