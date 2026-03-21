import prisma from '../utils/prisma';
import { ComponentType } from '@prisma/client';

interface CompatibilityData {
    componentType: ComponentType;
    deviceModelId?: number;
    subCategoryId?: number;
    compatibleModels: any;
}

export const create = async (data: CompatibilityData) => {
    return prisma.compatibility.create({
        data: {
            componentType: (data.componentType as string).toUpperCase() as ComponentType,
            deviceModelId: data.deviceModelId,
            subCategoryId: data.subCategoryId,
            compatibleModels: data.compatibleModels,
        },
    });
};

export const getAll = async () => {
    return prisma.compatibility.findMany({ 
        orderBy: { createdAt: 'desc' }, 
        include: { 
            deviceModel: { include: { device: true } },
            subCategory: true
        } 
    });
};

export const getById = async (id: number) => {
    return prisma.compatibility.findUnique({ 
        where: { id }, 
        include: { 
            deviceModel: { include: { device: true } },
            subCategory: true
        } 
    });
};

export const update = async (id: number, data: Partial<CompatibilityData>) => {
    const updateData: Record<string, unknown> = {};
    if (data.componentType) updateData.componentType = data.componentType;
    if (data.deviceModelId !== undefined) updateData.deviceModelId = data.deviceModelId;
    if (data.subCategoryId !== undefined) updateData.subCategoryId = data.subCategoryId;
    if (data.compatibleModels) updateData.compatibleModels = data.compatibleModels;

    return prisma.compatibility.update({ where: { id }, data: updateData });
};

export const remove = async (id: number) => {
    return prisma.compatibility.delete({ where: { id } });
};

export const search = async (modelId?: number, type?: string, brandId?: number, query?: string, subCategoryId?: number) => {
    const where: Record<string, any> = {};
    if (modelId) where.deviceModelId = modelId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (type) where.componentType = type.toUpperCase();

    // Scope to brand if provided (filter via device → deviceType)
    if (brandId) {
        where.deviceModel = {
            device: { deviceTypeId: brandId },
        };
    }

    // Text search: filter by device name or model name
    if (query) {
        where.OR = [
            { deviceModel: { name: { contains: query } } },
            { deviceModel: { device: { name: { contains: query } } } },
            { deviceModel: { device: { deviceType: { name: { contains: query } } } } },
        ];
        // If brandId was set, combine conditions
        if (brandId) {
            delete where.OR;
            where.AND = [
                { deviceModel: { device: { deviceTypeId: brandId } } },
                {
                    OR: [
                        { deviceModel: { name: { contains: query } } },
                        { deviceModel: { device: { name: { contains: query } } } },
                    ],
                },
            ];
            delete where.deviceModel;
        }
    }

    return prisma.compatibility.findMany({
        where,
        include: {
            deviceModel: {
                include: {
                    device: {
                        include: { deviceType: true },
                    },
                },
            },
            subCategory: true,
        },
    });
};
