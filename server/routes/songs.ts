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
    const filepath = req.file.path;
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

export default router;