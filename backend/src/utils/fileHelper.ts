import fs from 'fs';
import path from 'path';

/**
 * Deletes a file from the uploads directory.
 * @param relativePath - The relative path stored in the DB, e.g. 'services/filename.jpg' or just 'filename.jpg'
 */
export const deleteUploadedFile = (relativePath: string | null | undefined): void => {
    if (!relativePath) return;
    try {
        // Resolve from the uploads root in the project
        const fullPath = path.resolve(process.cwd(), 'uploads', relativePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (err) {
        // Log but don't throw — a missing file shouldn't block the update
        console.warn(`[deleteUploadedFile] Could not delete file "${relativePath}":`, err);
    }
};
