import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as paymentMethodController from '../controllers/paymentMethodController';

const router = Router();

router.get('/', authMiddleware, paymentMethodController.getAll);

export default router;
