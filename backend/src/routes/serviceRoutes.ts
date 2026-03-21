import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as serviceController from '../controllers/serviceController';

const router = Router();

// User endpoint (authenticated)
router.get('/', authMiddleware, serviceController.getAll);
router.get('/:id', authMiddleware, serviceController.getById);
router.get('/category/:categoryId', authMiddleware, serviceController.getByCategoryId);

export default router;
