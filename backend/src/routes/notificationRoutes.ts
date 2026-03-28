import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import prisma from '../utils/prisma';
import { AuthRequest } from '../middleware/auth';
import { Response, NextFunction } from 'express';

const router = Router();

// POST /api/notifications/register — save Expo push token for the current user
router.post('/register', authMiddleware, async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { pushToken } = req.body;
        if (!pushToken) {
            res.status(400).json({ success: false, message: 'pushToken is required' });
            return;
        }
        await prisma.user.update({
            where: { id: req.user!.id },
            data: { pushToken },
        });
        res.json({ success: true, message: 'Push token registered' });
    } catch (error) {
        next(error);
    }
});

export default router;
