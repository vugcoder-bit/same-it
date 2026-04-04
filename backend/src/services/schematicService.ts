import prisma from '../utils/prisma';
import fs from 'fs';
import path from 'path';

interface SchematicData {
    deviceId: number;
    schematicType: string;
    pdfFile: string;
}

export const create = async (data: SchematicData) => {
    return prisma.schematic.create({
        data: {
            deviceId: data.deviceId,
            schematicType: data.schematicType,
            pdfFile: data.pdfFile,
        },
    });
};

export const getAll = async () => {
    return prisma.schematic.findMany({ 
        orderBy: { uploadedAt: 'desc' }, 
        include: { device: { include: { deviceType: true } } } 
    });
};

export const getById = async (id: number) => {
    return prisma.schematic.findUnique({ 
        where: { id }, 
        include: { device: { include: { deviceType: true } } } 
    });
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

export const search = async (deviceId: number) => {
    return prisma.schematic.findMany({
        where: { deviceId },
        select: {
            id: true,
            deviceId: true,
            schematicType: true,
            uploadedAt: true,
            updatedAt: true,
            pdfFile: true,
            device: {
                include: {
                    deviceType: true
                }
            }
        }
    });
};
