import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import config from '../config';

export const login = async (username: string, password: string) => {
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
    if (user.role !== 'ADMIN' && user.subscriptionExpireDate) {
        if (new Date(user.subscriptionExpireDate) < new Date()) {
            const err = new Error('Subscription expired. Please renew your subscription.') as Error & { statusCode: number };
            err.statusCode = 401;
            throw err;
        }
    }
    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        config.jwtSecret,
        { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword, role: user.role };
};
