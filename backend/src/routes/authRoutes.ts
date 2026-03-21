import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import * as authController from '../controllers/authController';

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

export default router;
