import prisma from '../utils/prisma';

interface DeviceModelData {
    deviceId: number;
    name: string;
}

export const create = async (data: DeviceModelData) => {
    return prisma.deviceModel.create({
        data,
    });
};

export const getAll = async (filters: { deviceId?: number } = {}) => {
    const where: any = {};
    if (filters.deviceId) where.deviceId = filters.deviceId;

    return prisma.deviceModel.findMany({ 
        where,
        orderBy: { name: 'asc' },
        include: { device: true }
    });
};

export const getByDeviceId = async (deviceId: number) => {
    return prisma.deviceModel.findMany({
        where: { deviceId },
        orderBy: { name: 'asc' }
    });
};

export const getById = async (id: number) => {
    return prisma.deviceModel.findUnique({ where: { id }, include: { device: true } });
};

export const update = async (id: number, data: Partial<DeviceModelData>) => {
    return prisma.deviceModel.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    return prisma.deviceModel.delete({ where: { id } });
};
