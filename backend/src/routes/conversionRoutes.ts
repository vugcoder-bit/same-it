import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as conversionController from '../controllers/conversionController';

const router = Router();

// User endpoint (authenticated)
router.post('/', authMiddleware, conversionController.convertText);

export default router;
