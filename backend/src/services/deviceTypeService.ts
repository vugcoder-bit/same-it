import prisma from '../utils/prisma';

interface DeviceTypeData {
    name: string;
    imageUrl?: string;
}

export const create = async (data: DeviceTypeData) => {
    return (prisma as any).deviceType.create({
        data,
    });
};

export const getAll = async () => {
    return (prisma as any).deviceType.findMany({ orderBy: { name: 'asc' } });
};

export const getById = async (id: number) => {
    return (prisma as any).deviceType.findUnique({ where: { id }, include: { devices: true } });
};

export const update = async (id: number, data: Partial<DeviceTypeData>) => {
    return (prisma as any).deviceType.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    return (prisma as any).deviceType.delete({ where: { id } });
};
