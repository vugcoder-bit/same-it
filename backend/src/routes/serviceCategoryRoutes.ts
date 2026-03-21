import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as serviceCategoryController from '../controllers/serviceCategoryController';

const router = Router();

router.get('/', authMiddleware, serviceCategoryController.getAll);
router.get('/:id', authMiddleware, serviceCategoryController.getById);

export default router;
