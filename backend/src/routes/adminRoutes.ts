import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../middleware/validate';
import { authMiddleware, adminMiddleware } from '../middleware/auth';
import { uploadService, uploadSchematic, uploadAdvertisement, uploadDevice, uploadBrand, uploadComponent, uploadAdminFile } from '../middleware/upload';

// Controllers
import * as userController from '../controllers/userController';
import * as compatibilityController from '../controllers/compatibilityController';
import * as errorLogController from '../controllers/errorLogController';
import * as conversionController from '../controllers/conversionController';
import * as schematicController from '../controllers/schematicController';
import * as serviceController from '../controllers/serviceController';
import * as orderController from '../controllers/orderController';
import * as deviceController from '../controllers/deviceController';
import * as deviceModelController from '../controllers/deviceModelController';
import * as deviceTypeController from '../controllers/deviceTypeController';
import * as subCategoryController from '../controllers/componentSubCategoryController';

import * as serviceCategoryController from '../controllers/serviceCategoryController';
import * as paymentMethodController from '../controllers/paymentMethodController';
import * as dashboardController from '../controllers/dashboardController';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware, adminMiddleware);

// ─── Dashboard ────────────────────────────────────────
router.get('/dashboard/stats', dashboardController.getStats);

// ─── Users ────────────────────────────────────────────
router.post(
    '/users',
    [
        body('username').notEmpty().withMessage('Username is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    validate,
    userController.createUser,
);
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
// Admin: clear a user's linked device ID so they can log in on a new device
router.delete('/users/:id/device', userController.clearDevice);

// ─── Devices ──────────────────────────────────────────
router.post(
    '/devices',
    uploadDevice.single('image'),
    deviceController.create,
);
router.get('/devices', deviceController.getAll);
router.put('/devices/:id', uploadDevice.single('image'), deviceController.update);
router.delete('/devices/:id', deviceController.remove);

// ─── Device Types ─────────────────────────────────────
router.post('/device-types', uploadBrand.single('image'), deviceTypeController.create);
router.get('/device-types', deviceTypeController.getAll);
router.put('/device-types/:id', uploadBrand.single('image'), deviceTypeController.update);
router.delete('/device-types/:id', deviceTypeController.remove);

// ─── Device Models ────────────────────────────────────
router.post('/device-models', deviceModelController.create);
router.get('/device-models', deviceModelController.getAll);
router.put('/device-models/:id', deviceModelController.update);
router.delete('/device-models/:id', deviceModelController.remove);

// ─── Compatibility ────────────────────────────────────
router.post(
    '/compatibility',
    [
        body('componentType').notEmpty().withMessage('Component type is required'),
        body('deviceModelId').isInt({ min: 1 }).withMessage('A valid device model is required'),
        body('compatibleModels').notEmpty().withMessage('Compatible models are required'),
    ],
    validate,
    compatibilityController.create,
);
router.get('/compatibility', compatibilityController.getAll);
router.put('/compatibility/:id', compatibilityController.update);
router.delete('/compatibility/:id', compatibilityController.remove);

// ─── Error Logs ───────────────────────────────────────
router.post(
    '/errors',
    [
        body('errorCode').notEmpty().withMessage('Error code is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('solution').notEmpty().withMessage('Solution is required'),
    ],
    validate,
    errorLogController.create,
);
router.get('/errors', errorLogController.getAll);
router.put('/errors/:id', errorLogController.update);
router.delete('/errors/:id', errorLogController.remove);

// ─── Conversion Rules ─────────────────────────────────
router.post(
    '/conversion-rules',
    [
        body('arabicLetter').notEmpty().withMessage('Arabic letter is required'),
        body('symbol').notEmpty().withMessage('Symbol is required'),
    ],
    validate,
    conversionController.create,
);
router.get('/conversion-rules', conversionController.getAll);
router.put('/conversion-rules/:id', conversionController.update);
router.delete('/conversion-rules/:id', conversionController.remove);

// ─── Schematics ───────────────────────────────────────
router.post('/schematics', uploadSchematic.single('pdfFile'), schematicController.create);
router.get('/schematics', schematicController.getAll);
router.put('/schematics/:id', uploadSchematic.single('pdfFile'), schematicController.update);
router.delete('/schematics/:id', schematicController.remove);

// ─── Services ─────────────────────────────────────────
router.post('/services', uploadService.single('image'), serviceController.create);
router.get('/services', serviceController.getAll);
router.get('/services/category/:categoryId', serviceController.getByCategoryId);
router.put('/services/:id', uploadService.single('image'), serviceController.update);
router.delete('/services/:id', serviceController.remove);

// ─── Service Categories ───────────────────────────────
router.post('/service-categories', uploadService.single('image'), serviceCategoryController.create);
router.get('/service-categories', serviceCategoryController.getAll);
router.get('/service-categories/:id', serviceCategoryController.getById);
router.put('/service-categories/:id', uploadService.single('image'), serviceCategoryController.update);
router.delete('/service-categories/:id', serviceCategoryController.remove);

// ─── Payment Methods ──────────────────────────────────
router.post('/payment-methods', paymentMethodController.create);
router.get('/payment-methods', paymentMethodController.getAll);
router.put('/payment-methods/:id', paymentMethodController.update);
router.delete('/payment-methods/:id', paymentMethodController.remove);

// ─── Orders ───────────────────────────────────────────
router.get('/orders', orderController.getAllOrders);
router.put('/orders/:id/status', uploadAdminFile.single('adminFile'), orderController.updateOrderStatus);

// ─── Component Sub-Categories ─────────────────────────
router.get('/component-sub-categories', subCategoryController.getAll);
router.get('/component-sub-categories/:type', subCategoryController.getByType);
router.post('/component-sub-categories', uploadComponent.single('image'), subCategoryController.create);
router.put('/component-sub-categories/:id', uploadComponent.single('image'), subCategoryController.update);
router.delete('/component-sub-categories/:id', subCategoryController.remove);

// ─── Advertisements (Admin CRUD) ──────────────────────
import { PrismaClient } from '@prisma/client';
const _prisma = new PrismaClient();
router.get('/advertisements', async (_req, res) => {
    try {
        const ads = await _prisma.advertisement.findMany({ orderBy: { createdAt: 'desc' } });
        res.json({ success: true, data: ads });
    } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
});
router.post('/advertisements', uploadAdvertisement.single('image'), async (req: any, res: any) => {
    try {
        if (!req.file) return res.status(400).json({ success: false, message: 'Image required' });
        const baseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${baseUrl}/uploads/advertisements/${req.file.filename}`;
        const ad = await _prisma.advertisement.create({ data: { imageUrl } });
        res.status(201).json({ success: true, data: ad });
    } catch (e) { res.status(500).json({ success: false, message: 'Error creating ad' }); }
});
router.delete('/advertisements/:id', async (req: any, res: any) => {
    try {
        const id = Number(req.params.id);
        await _prisma.advertisement.delete({ where: { id } });
        res.json({ success: true, message: 'Advertisement deleted' });
    } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
});

export default router;
