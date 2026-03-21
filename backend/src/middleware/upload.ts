import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

const ensureDir = (dir: string): string => {
    const fullPath = path.join(__dirname, '../../uploads', dir);
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }
    return fullPath;
};

const serviceStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('services')),
    filename: (_req, file, cb) => cb(null, `service-${Date.now()}${path.extname(file.originalname)}`),
});

const brandStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('brands')),
    filename: (_req, file, cb) => cb(null, `brand-${Date.now()}${path.extname(file.originalname)}`),
});

const deviceStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('devices')),
    filename: (_req, file, cb) => cb(null, `device-${Date.now()}${path.extname(file.originalname)}`),
});

const componentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('components')),
    filename: (_req, file, cb) => cb(null, `component-${Date.now()}${path.extname(file.originalname)}`),
});

const paymentStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('payments')),
    filename: (_req, file, cb) => cb(null, `payment-${Date.now()}${path.extname(file.originalname)}`),
});

const schematicStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('schematics')),
    filename: (_req, file, cb) => cb(null, `schematic-${Date.now()}${path.extname(file.originalname)}`),
});

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed.'));
};

const pdfFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback): void => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Only PDF files are allowed.'));
};

const advertisementStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('advertisements')),
    filename: (_req, file, cb) => cb(null, `ad-${Date.now()}${path.extname(file.originalname)}`),
});

const adminFileStorage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, ensureDir('admin-files')),
    filename: (_req, file, cb) => cb(null, `admin-file-${Date.now()}${path.extname(file.originalname)}`),
});

export const uploadService = multer({ storage: serviceStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadBrand = multer({ storage: brandStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadDevice = multer({ storage: deviceStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadComponent = multer({ storage: componentStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadPayment = multer({ storage: paymentStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadSchematic = multer({ storage: schematicStorage, fileFilter: pdfFilter, limits: { fileSize: 50 * 1024 * 1024 } });
export const uploadAdvertisement = multer({ storage: advertisementStorage, fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } });
export const uploadAdminFile = multer({ storage: adminFileStorage, limits: { fileSize: 50 * 1024 * 1024 } });
