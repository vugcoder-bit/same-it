import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import config from '../config';
import { isSubscriptionExpired } from '../utils/dateHelper';

export const login = async (username: string, password: string, deviceId?: string) => {
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
        const err = new Error('Invalid credentials') as Error & { statusCode: number };
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        const err = new Error('Invalid credentials') as Error & { statusCode: number };
        err.statusCode = 401;
        throw err;
    }

    // Subscription expiration check — admins bypass
    if (user.role !== 'ADMIN' && isSubscriptionExpired(user.subscriptionExpireDate)) {
        const err = new Error('Subscription expired. Please renew your subscription.') as Error & { statusCode: number };
        err.statusCode = 401;
        throw err;
    }

    // Device lock check — only applies to regular users, not admins
    if (user.role !== 'ADMIN' && deviceId) {
        if (user.deviceId && user.deviceId !== deviceId) {
            const err = new Error('This account is linked to another device. Please contact admin to switch devices.') as Error & { statusCode: number };
            err.statusCode = 403;
            throw err;
        }
        // Save device ID if not already set
        if (!user.deviceId) {
            await prisma.user.update({ where: { id: user.id }, data: { deviceId } });
        }
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '5d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return { token, user: userWithoutPassword, role: user.role };
};

export const updatePushToken = async (userId: number, pushToken: string) => {
    return prisma.user.update({
        where: { id: userId },
        data: { pushToken },
    });
};
