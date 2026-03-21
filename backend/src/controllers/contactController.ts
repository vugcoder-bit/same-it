import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/prisma';

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, message } = req.body;
        const newMessage = await (prisma as any).contactMessage.create({
            data: { name, email, message }
        });
        
        // In a real scenario, we'd trigger an email here.
        // For now we just record it.
        console.log(`New contact message from ${email}`);
        
        res.status(201).json({ success: true, data: newMessage });
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const messages = await (prisma as any).contactMessage.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: messages });
    } catch (error) {
        next(error);
    }
};
