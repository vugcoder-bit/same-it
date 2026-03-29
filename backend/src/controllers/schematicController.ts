import { Request, Response, NextFunction } from 'express';
import * as schematicService from '../services/schematicService';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { deleteUploadedFile } from '../utils/fileHelper';
import { isSubscriptionExpired } from '../utils/dateHelper';

// ── One-Time Token Store ──
// With PM2 cluster mode, in-memory stores don't work across instances.
// We rely solely on JWT verification (expiry, IP binding, action validation).
const normalizeIp = (ip: string) => (ip === '::1' || ip === '127.0.0.1') ? '127.0.0.1' : ip.replace(/^::ffff:/, '');

// ── CRUD (Admin) ──

export const create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ success: false, message: 'PDF file is required' });
            return;
        }
        const data = {
            deviceModelId: parseInt(req.body.deviceModelId as string),
            schematicType: req.body.schematicType,
            pdfFile: req.file.filename,
        };
        const item = await schematicService.create(data);
        res.status(201).json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const items = await schematicService.getAll();
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updateData: any = {};
        if (req.body.deviceModelId) updateData.deviceModelId = parseInt(req.body.deviceModelId as string);
        if (req.body.schematicType) updateData.schematicType = req.body.schematicType;

        if (req.file) {
            // Delete old PDF from disk before saving the new one
            const existing = await schematicService.getById(parseInt(req.params.id as string));
            if (existing?.pdfFile) {
                deleteUploadedFile(`schematics/${existing.pdfFile}`);
            }
            updateData.pdfFile = req.file.filename;
        }

        const item = await schematicService.update(parseInt(req.params.id as string), updateData);
        res.json({ success: true, data: item });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Delete PDF file from disk before removing the DB record
        const existing = await schematicService.getById(parseInt(req.params.id as string));
        if (existing?.pdfFile) {
            deleteUploadedFile(`schematics/${existing.pdfFile}`);
        }
        await schematicService.remove(parseInt(req.params.id as string));
        res.json({ success: true, message: 'Schematic deleted' });
    } catch (error) {
        next(error);
    }
};

export const search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { deviceModelId } = req.query;
        if (!deviceModelId) {
            res.status(400).json({ success: false, message: 'Query parameter "deviceModelId" is required' });
            return;
        }
        const items = await schematicService.search(parseInt(deviceModelId as string));
        res.json({ success: true, data: items });
    } catch (error) {
        next(error);
    }
};

export const download = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const schematic = await schematicService.getById(parseInt(req.params.id as string));
        if (!schematic) {
            res.status(404).json({ success: false, message: 'Schematic not found' });
            return;
        }
        const filePath = path.join(__dirname, '../../uploads/schematics', schematic.pdfFile);
        res.download(filePath, schematic.pdfFile);
    } catch (error) {
        next(error);
    }
};

// ── Secure PDF Access ──

export const generateTempUrl = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const schematicId = parseInt(req.params.id as string);
        const schematic = await schematicService.getById(schematicId);
        if (!schematic) {
            res.status(404).json({ success: false, message: 'Schematic not found' });
            return;
        }

        // Subscription check
        if (req.user) {
            const user = await prisma.user.findUnique({ where: { id: req.user.id } });
            if (user && user.role !== 'ADMIN' && isSubscriptionExpired(user.subscriptionExpireDate)) {
                res.status(401).json({ success: false, message: 'Subscription expired. Please renew your subscription.' });
                return;
            }
        }

        const requesterIp = normalizeIp(req.ip || req.socket.remoteAddress || 'unknown');
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { id: schematicId, action: 'view_pdf', ip: requesterIp },
            secret,
            { expiresIn: '2m' }
        );

        console.log(`[PDF TOKEN] Generated for schematic ${schematicId} (IP: ${requesterIp})`);

        const url = `/api/schematics/view?token=${token}`;
        res.json({ success: true, data: { url } });
    } catch (error) {
        next(error);
    }
};

export const viewPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log(`[PDF VIEW] Hit with token: ${req.query.token?.toString().substring(0, 15)}...`);
        const { token } = req.query;
        if (!token) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token as string, secret) as any;

        if (decoded.action !== 'view_pdf' || !decoded.id) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }

        // IP binding check
        const requesterIp = normalizeIp(req.ip || req.socket.remoteAddress || 'unknown');
        if (decoded.ip !== requesterIp) {
            console.error(`[PDF VIEW] IP mismatch: stored=${decoded.ip}, requester=${requesterIp}`);
            res.status(403).json({ success: false, message: 'IP mismatch. Access denied.' });
            return;
        }

        const schematic = await schematicService.getById(decoded.id);
        if (!schematic) {
            res.status(404).json({ success: false, message: 'Schematic not found' });
            return;
        }

        const filePath = path.join(__dirname, '../../uploads/schematics', schematic.pdfFile);
        console.log(`[PDF VIEW] Serving file: ${filePath}, Exists: ${fs.existsSync(filePath)}`);
        
        res.sendFile(filePath, (err) => {
            if (err) {
                console.error(`[PDF VIEW] SendFile Error: ${err.message}`);
                // Only send error if headers not already sent
                if (!res.headersSent) {
                    res.status(500).json({ success: false, message: 'Error serving PDF file' });
                }
            } else {
                console.log(`[PDF VIEW] File served successfully: ${schematic.pdfFile}`);
            }
        });
    } catch (error: any) {
        console.error(`[PDF VIEW] Error: ${error.message}`);
        res.status(401).json({ success: false, message: 'Token expired or invalid' });
    }
};
