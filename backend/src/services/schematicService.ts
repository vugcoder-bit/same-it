import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

interface SchematicData {
    deviceModelId: number;
    schematicType: string;
    pdfFile: string;
}

export const create = async (data: SchematicData) => {
    return prisma.schematic.create({
        data: {
            deviceModelId: data.deviceModelId,
            schematicType: data.schematicType,
            pdfFile: data.pdfFile,
        },
    });
};

export const getAll = async () => {
    return prisma.schematic.findMany({ orderBy: { uploadedAt: 'desc' }, include: { deviceModel: { include: { device: true } } } });
};

export const getById = async (id: number) => {
    return prisma.schematic.findUnique({ where: { id }, include: { deviceModel: { include: { device: true } } } });
};

export const update = async (id: number, data: Partial<SchematicData>) => {
    return prisma.schematic.update({ where: { id }, data });
};

export const remove = async (id: number) => {
    const schematic = await prisma.schematic.findUnique({ where: { id } });
    if (schematic && schematic.pdfFile) {
        const filePath = path.join(__dirname, '../../uploads/schematics', schematic.pdfFile);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    return prisma.schematic.delete({ where: { id } });
};

export const search = async (deviceModelId: number) => {
    return prisma.schematic.findMany({
        where: { deviceModelId },
        select: {
            id: true,
            deviceModelId: true,
            schematicType: true,
            uploadedAt: true,
            updatedAt: true,
            deviceModel: {
                include: {
                    device: true
                }
            }
        }
    });
};
