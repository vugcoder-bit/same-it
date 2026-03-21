import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as deviceTypeController from '../controllers/deviceTypeController';

const router = Router();

// Public/User endpoints (authenticated)
router.get('/', authMiddleware, deviceTypeController.getAll);
router.get('/:id', authMiddleware, deviceTypeController.getById);

export default router;
