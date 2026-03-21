import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as errorLogController from '../controllers/errorLogController';

const router = Router();

// User endpoint (authenticated)
router.get('/', authMiddleware, errorLogController.getAll);

export default router;
