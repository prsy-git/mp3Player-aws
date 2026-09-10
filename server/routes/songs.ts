import {Router} from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import db from '../db/db.js';
import {requireAuth} from '../middleware/auth.js';

const router = Router();

//multer file upload handling
const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },

    filename: (req, file, cb) => {
        const originalName = file.originalname
        const cleanedName = originalName.replaceAll(' ', '');
        cb(null, cleanedName)
    }
});

const upload = multer({ storage: fileStorage });

router.post('/upload', requireAuth, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file passed to backend' });
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

        res.status(201).json({ 
            message: ' File successfully uploaded ',
            songId: result.lastInsertRowid,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Specific database error on file upload attempt: ', error);
        res.status(500).json({ error: 'Could not upload song in database' });
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
        const statement = db.prepare(query)
        const result = statement.all(uploadingUser) //user songs

        res.status(200).json({ songs: result });
    } catch (error) {
        console.error('Database error fetching tracks for user:', error);
        res.status(500).json({ error: 'Could not fetch songs from database '});
    }
});

router.delete('/:id', requireAuth, (req, res) => {
    const songId = req.params.id;
    const uploadingUser = req.session.userId;

    try {
        const selectQuery = `
            SELECT filePath
            FROM Songs
            WHERE songId = ? AND uploadingUser = ?
        `;
        
        const song = db.prepare(selectQuery).get(songId, uploadingUser) as { filePath: string };

        if (!song) {
            return res.status(404).json({ error: 'Song not found or not authorized to retrieve song '});
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
        const absolutePath = path.join(process.cwd(), 'server', relativePath);

        fs.unlink(absolutePath, (err) => {
            if (err) {
                console.warn(`Row removed, but files not deleted from upload bucket / backend at ${absolutePath}`);
            }
        });

        res.status(200).json({ message: 'Song deleted'});
    }   catch (error) {
        console.error('Database error deleting song:', error);
        res.status(500).json({ error: 'Could not delete song' });
    }
})

export default router;