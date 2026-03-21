import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as settingsController from '../controllers/settingsController';

const router = Router();

// Publicly available settings (for Mobile App)
router.get('/', settingsController.getSettings);

// Admin only update
router.put('/', authMiddleware, adminMiddleware, settingsController.updateSettings);

export default router;
