import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as deviceController from '../controllers/deviceController';
import * as deviceTypeController from '../controllers/deviceTypeController';

const router = Router();

// User endpoints (authenticated)
router.get('/', authMiddleware, deviceController.getAll);
router.get('/:id', authMiddleware, deviceController.getById);

export default router;
