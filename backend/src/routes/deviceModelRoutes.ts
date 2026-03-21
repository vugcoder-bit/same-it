import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as deviceModelController from '../controllers/deviceModelController';

const router = Router();

// User endpoints (authenticated)
router.get('/', authMiddleware, deviceModelController.getAll);
router.get('/device/:deviceId', authMiddleware, deviceModelController.getByDeviceId);
router.get('/:id', authMiddleware, deviceModelController.getById);

export default router;
