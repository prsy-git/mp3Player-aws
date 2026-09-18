import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import db from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';
import { randomUUID } from 'crypto';
const router = Router();
//multer file upload handling
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname);
        const uniqueFilename = `${randomUUID()}${extension}`;
        cb(null, uniqueFilename);
    }
});
const upload = multer({ storage: fileStorage });
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            error: 'No file passed to backend'
        });
    }
    const title = req.body.title || req.file.originalname;
    const filepath = `/uploads/${req.file.filename}`;
    const uploadingUser = req.session.userId;
    try {
        const query = `
            INSERT INTO Songs (title, filePath, uploadingUser)
            VALUES (?, ?, ?)
        `;
        const statement = db.prepare(query);
        const result = statement.run(title, filepath, uploadingUser);
        return res.status(201).json({
            message: 'File successfully uploaded',
            songId: result.lastInsertRowid,
            filename: req.file.filename
        });
    }
    catch (error) {
        console.error('Specific database error on file upload attempt:', error);
        try {
            await fs.unlink(req.file.path);
        }
        catch (cleanupError) {
            console.error('Database insert failed and uploaded file cleanup also failed:', cleanupError);
        }
        return res.status(500).json({
            error: 'Could not upload song in database'
        });
    }
});
router.get('/', requireAuth, (req, res) => {
    const uploadingUser = req.session.userId;
    try {
        const query = `
            SELECT songId, title, filePath
            FROM Songs
            WHERE uploadingUser = ?
        `;
        const statement = db.prepare(query);
        const result = statement.all(uploadingUser); //user songs
        res.status(200).json({ songs: result });
    }
    catch (error) {
        console.error('Database error fetching tracks for user:', error);
        res.status(500).json({ error: 'Could not fetch songs from database ' });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    const songId = req.params.id;
    const uploadingUser = req.session.userId;
    try {
        const selectQuery = `
            SELECT filePath
            FROM Songs
            WHERE songId = ? AND uploadingUser = ?
        `;
        const song = db.prepare(selectQuery).get(songId, uploadingUser);
        if (!song) {
            return res.status(404).json({ error: 'Song not found or not authorized to retrieve song ' });
        }
        const deleteQuery = `
            DELETE FROM Songs
            WHERE songId = ? AND uploadingUser = ?
        `;
        const deleteStatement = db.prepare(deleteQuery);
        const deleteResult = deleteStatement.run(songId, uploadingUser);
        if (deleteResult.changes == 0) {
            return res.status(400).json({ error: 'Could not remove song record from database' });
        }
        const relativePath = song.filePath?.startsWith('/') ? song.filePath.slice(1) : song.filePath;
        const absolutePath = path.join(process.cwd(), relativePath);
        try {
            await fs.unlink(absolutePath);
        }
        catch (error) {
            if (error.code === 'ENOENT') {
                console.warn(`Audio file already not present in database: ${absolutePath}`);
            }
            else {
                console.error(`Song record deleted but audio file not detected at: ${absolutePath}`, error);
            }
        }
        res.status(200).json({ message: 'Song deleted' });
    }
    catch (error) {
        console.error('Database error deleting song:', error);
        res.status(500).json({ error: 'Could not delete song' });
    }
});
export default router;
