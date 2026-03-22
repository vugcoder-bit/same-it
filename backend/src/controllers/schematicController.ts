import { Request, Response, NextFunction } from 'express';
import * as schematicService from '../services/schematicService';
import path from 'path';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { deleteUploadedFile } from '../utils/fileHelper';

// ── One-Time Token Store ──
// Each token can only be used once and is bound to the requester's IP.
interface PdfToken {
    schematicId: number;
    ip: string;
    usedCount: number;
    expiresAt: number; // Unix timestamp in ms
}

const tokenStore = new Map<string, PdfToken>();

// Clean up expired tokens every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, token] of tokenStore.entries()) {
        if (now > token.expiresAt) tokenStore.delete(id);
    }
}, 5 * 60 * 1000);

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
            if (user && user.role !== 'ADMIN') {
                if (!user.subscriptionExpireDate || new Date(user.subscriptionExpireDate) < new Date()) {
                    res.status(401).json({ success: false, message: 'Subscription expired. Please renew your subscription.' });
                    return;
                }
            }
        }

        // Generate one-time token
        const tokenId = randomUUID();
        const requesterIp = req.ip || req.socket.remoteAddress || 'unknown';
        const expiresInMs = 2 * 60 * 1000; // 2 minutes

        tokenStore.set(tokenId, {
            schematicId,
            ip: requesterIp,
            usedCount: 0,
            expiresAt: Date.now() + expiresInMs,
        });

        console.log(`[PDF TOKEN] Generated: ${tokenId} for schematic ${schematicId} (IP: ${requesterIp})`);

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const token = jwt.sign(
            { tokenId, id: schematicId, action: 'view_pdf', ip: requesterIp },
            secret,
            { expiresIn: '2m' }
        );

        const url = `/api/schematics/view?token=${token}`;
        res.json({ success: true, data: { url } });
    } catch (error) {
        next(error);
    }
};

export const viewPdf = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { token } = req.query;
        if (!token) {
            res.status(401).json({ success: false, message: 'No token provided' });
            return;
        }

        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token as string, secret) as any;

        if (decoded.action !== 'view_pdf' || !decoded.id || !decoded.tokenId) {
            res.status(401).json({ success: false, message: 'Invalid token' });
            return;
        }

        // One-time token validation
        const storedToken = tokenStore.get(decoded.tokenId);
        if (!storedToken) {
            console.error(`[PDF VIEW] Token not found or expired in store: ${decoded.tokenId}`);
            res.status(401).json({ success: false, message: 'Token not found or expired' });
            return;
        }

        if (storedToken.usedCount >= 5) {
            console.error(`[PDF VIEW] Token usage limit exceeded (5): ${decoded.tokenId}`);
            res.status(401).json({ success: false, message: 'Token usage limit exceeded' });
            return;
        }

        if (Date.now() > storedToken.expiresAt) {
            tokenStore.delete(decoded.tokenId);
            console.error(`[PDF VIEW] Token expired: ${decoded.tokenId}`);
            res.status(401).json({ success: false, message: 'Token expired' });
            return;
        }

        // IP binding check
        const requesterIp = req.ip || req.socket.remoteAddress || 'unknown';
        console.log(`[PDF VIEW] Token ${decoded.tokenId} usage ${storedToken.usedCount + 1}. Requester IP: ${requesterIp}, Stored IP: ${storedToken.ip}`);
        
        if (storedToken.ip !== requesterIp) {
            console.error(`[PDF VIEW] IP mismatch: stored=${storedToken.ip}, requester=${requesterIp}`);
            res.status(403).json({ success: false, message: 'IP mismatch. Access denied.' });
            return;
        }

        // Increment usage count
        storedToken.usedCount += 1;

        const schematic = await schematicService.getById(decoded.id);
        if (!schematic) {
            res.status(404).json({ success: false, message: 'Schematic not found' });
            return;
        }

        const filePath = path.join(__dirname, '../../uploads/schematics', schematic.pdfFile);
        res.sendFile(filePath);
    } catch (error: any) {
        console.error(`[PDF VIEW] Error: ${error.message}`);
        res.status(401).json({ success: false, message: 'Token expired or invalid' });
    }
};
