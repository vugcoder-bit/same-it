import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import * as schematicController from '../controllers/schematicController';

const router = Router();

// User endpoints (authenticated)
router.get('/', authMiddleware, schematicController.search);
router.get('/:id/download', authMiddleware, schematicController.download);
router.get('/:id/generate-url', authMiddleware, schematicController.generateTempUrl);

// Public but token-protected endpoint for viewer
router.get('/view', schematicController.viewPdf);

export default router;
