import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';

// Routes
import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import compatibilityRoutes from './routes/compatibilityRoutes';
import errorLogRoutes from './routes/errorLogRoutes';
import conversionRoutes from './routes/conversionRoutes';
import schematicRoutes from './routes/schematicRoutes';
import serviceRoutes from './routes/serviceRoutes';
import orderRoutes from './routes/orderRoutes';
import advertisementRoutes from './routes/advertisementRoutes'; // Import ad routes
import deviceRoutes from './routes/deviceRoutes';
import deviceModelRoutes from './routes/deviceModelRoutes';
import deviceTypeRoutes from './routes/deviceTypeRoutes';
import serviceCategoryRoutes from './routes/serviceCategoryRoutes';
import paymentMethodRoutes from './routes/paymentMethodRoutes';
import settingsRoutes from './routes/settingsRoutes';
import contactRoutes from './routes/contactRoutes';
import notificationRoutes from './routes/notificationRoutes';

// Middleware
import errorHandler from './middleware/errorHandler';

const app = express();

// ─── Global Middleware ────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Detailed Request/Response Logger
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Log Request
    if (req.headers.authorization) console.log('Auth:', req.headers.authorization.substring(0, 15) + '...');
    if (req.body && Object.keys(req.body).length) console.log('Request Body:', JSON.stringify(req.body, null, 2));

    // Capture original res.json to log response
    const originalJson = res.json;
    res.json = function (body: any) {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] Response ${res.statusCode} (${duration}ms):`, JSON.stringify(body, null, 2));
        return originalJson.call(this, body);
    };

    next();
});

// Rate limiting (Disabled for debugging)
/*
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);
*/

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/compatibility', compatibilityRoutes);
app.use('/api/errors', errorLogRoutes);
app.use('/api/convert', conversionRoutes);
app.use('/api/schematics', schematicRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/advertisements', advertisementRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/device-models', deviceModelRoutes);
app.use('/api/device-types', deviceTypeRoutes);
app.use('/api/service-categories', serviceCategoryRoutes);
app.use('/api/payment-methods', paymentMethodRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/notifications', notificationRoutes);

// Public sub-category routes for mobile
import { Router } from 'express';
import { PrismaClient as PkgPrismaClient } from '@prisma/client';
const _pubPrisma = new PkgPrismaClient();
const subCatPublicRouter = Router();
subCatPublicRouter.get('/:type', async (req: any, res: any) => {
    try {
        const type = req.params.type.toUpperCase();
        const items = await _pubPrisma.componentSubCategory.findMany({
            where: { componentType: type as any },
            orderBy: { name: 'asc' },
        });
        res.json({ success: true, data: items });
    } catch (e) { res.status(500).json({ success: false, message: 'Error' }); }
});
app.use('/api/component-sub-categories', subCatPublicRouter);

// Health check
app.get('/api/health', (_req, res) => {
    console.log('Health check requested at:', new Date().toISOString());
    res.json({ success: true, message: 'Same IT API is running', timestamp: new Date().toISOString() });
});

// ─── Error Handler (must be last) ─────────────────────
app.use(errorHandler);

export default app;
