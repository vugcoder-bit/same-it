import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all advertisements (Public)
router.get('/', async (req, res) => {
    try {
        const ads = await prisma.advertisement.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        console.error('Error fetching ads:', error);
        res.status(500).json({ success: false, message: 'Server error fetching advertisements' });
    }
});

// Create a new advertisement (Admin Only)
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) {
            return res.status(400).json({ success: false, message: 'imageUrl is required' });
        }

        const ad = await prisma.advertisement.create({
            data: { imageUrl }
        });

        res.status(201).json({ success: true, message: 'Advertisement created successfully', data: ad });
    } catch (error) {
        console.error('Error creating ad:', error);
        res.status(500).json({ success: false, message: 'Server error creating advertisement' });
    }
});

// Delete an advertisement (Admin Only)
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const id = Number(req.params.id);

        // Find first
        const existingAd = await prisma.advertisement.findUnique({ where: { id } });
        if (!existingAd) {
            return res.status(404).json({ success: false, message: 'Advertisement not found' });
        }

        await prisma.advertisement.delete({ where: { id } });

        res.status(200).json({ success: true, message: 'Advertisement deleted successfully' });
    } catch (error) {
        console.error('Error deleting ad:', error);
        res.status(500).json({ success: false, message: 'Server error deleting advertisement' });
    }
});

export default router;
