import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { Role } from '@prisma/client';

interface CreateUserData {
    username: string;
    password: string;
    role?: Role;
    subscriptionExpireDate?: string;
}

interface UpdateUserData {
    username?: string;
    password?: string;
    role?: Role;
    subscriptionExpireDate?: string;
}

export const createUser = async (data: CreateUserData) => {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            username: data.username,
            password: hashedPassword,
            role: data.role || 'USER',
            subscriptionExpireDate: data.subscriptionExpireDate && !isNaN(new Date(data.subscriptionExpireDate).getTime()) 
                ? new Date(data.subscriptionExpireDate) 
                : null,
        },
    });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const getUsers = async () => {
    return prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            subscriptionExpireDate: true,
            createdAt: true,
        },
    });
};

export const getUserById = async (id: number) => {
    return prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            username: true,
            role: true,
            subscriptionExpireDate: true,
            createdAt: true,
        },
    });
};

export const updateUser = async (id: number, data: UpdateUserData) => {
    const updateData: Record<string, unknown> = {};
    if (data.username) updateData.username = data.username;
    if (data.password) updateData.password = await bcrypt.hash(data.password, 10);
    if (data.role) updateData.role = data.role;
    if (data.subscriptionExpireDate && !isNaN(new Date(data.subscriptionExpireDate).getTime())) {
        updateData.subscriptionExpireDate = new Date(data.subscriptionExpireDate);
    } else if (data.subscriptionExpireDate !== undefined) {
        updateData.subscriptionExpireDate = null;
    }

    const user = await prisma.user.update({ where: { id }, data: updateData });
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

export const deleteUser = async (id: number) => {
    return prisma.user.delete({ where: { id } });
};
