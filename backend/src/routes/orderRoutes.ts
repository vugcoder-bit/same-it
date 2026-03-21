import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import { authMiddleware } from '../middleware/auth';
import { uploadPayment } from '../middleware/upload';
import * as orderController from '../controllers/orderController';

const router = Router();

// User endpoints (authenticated)
router.post(
    '/',
    authMiddleware,
    uploadPayment.single('paymentScreenshot'),
    [
        body('serviceId').notEmpty().withMessage('Service ID is required'),
        body('phone1').notEmpty().withMessage('Phone number is required'),
    ],
    validate,
    orderController.create,
);

router.get('/my', authMiddleware, orderController.getMyOrders);

export default router;
