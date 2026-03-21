import prisma from '../utils/prisma';

interface ErrorLogData {
    errorCode: string;
    description: string;
    solution: string;
}

export const create = async (data: ErrorLogData) => {
    return prisma.errorLog.create({
        data: {
            errorCode: data.errorCode,
            description: data.description,
            solution: data.solution,
        },
    });
};

export const getAll = async () => {
    return prisma.errorLog.findMany({ orderBy: { createdAt: 'desc' } });
};

export const getById = async (id: number) => {
    return prisma.errorLog.findUnique({ where: { id } });
};

export const update = async (id: number, data: Partial<ErrorLogData>) => {
    const updateData: Record<string, unknown> = {};
    if (data.errorCode) updateData.errorCode = data.errorCode;
    if (data.description) updateData.description = data.description;
    if (data.solution) updateData.solution = data.solution;

    return prisma.errorLog.update({ where: { id }, data: updateData });
};

export const remove = async (id: number) => {
    return prisma.errorLog.delete({ where: { id } });
};

export const search = async (code: string) => {
    return prisma.errorLog.findMany({
        where: { errorCode: { contains: code } },
    });
};
