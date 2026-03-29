import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import * as authController from '../controllers/authController';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { Response } from 'express';

const router = Router();

router.post(
    '/login',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    validate,
    authController.login,
);

// Verify current session — used by mobile on app load to detect expired subscription
router.get('/me', authMiddleware, (req: AuthRequest, res: Response) => {
    res.json({ success: true, data: req.user });
});

// Update Expo push token for authenticated user
router.post(
    '/update-token',
    authMiddleware,
    authController.updatePushToken
);

export default router;
