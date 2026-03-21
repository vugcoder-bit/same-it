import { Router } from 'express';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import * as contactController from '../controllers/contactController';

const router = Router();

// Public: Users can send contact messages
router.post('/', contactController.createMessage);

// Admin: View messages
router.get('/', authMiddleware, adminMiddleware, contactController.getMessages);

export default router;
