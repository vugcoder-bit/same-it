import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as compatibilityController from '../controllers/compatibilityController';

const router = Router();

// User endpoint (search for compatibility data)
router.get('/search', authMiddleware, compatibilityController.search);

export default router;
