import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { randomUUID } from 'crypto';
import {
    DeleteObjectCommand,
    GetObjectCommand,
    PutObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import pool from '../db/rds-postgres.js';
import { requireAuth } from '../middleware/auth.js';
import s3, { S3_BUCKET_NAME } from '../storage/s3.js';

const router = Router();

// Multer file upload handling.
// Files remain local for now; S3 migration comes afterward.
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

// Upload a song
router.post(
    '/upload',
    requireAuth,
    upload.single('file'),
    async (req, res) => {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file passed to backend'
            });
        }

        const title = req.body.title || req.file.originalname;
        const uploadingUser = req.session.userId;

        // Store files under a predictable private S3 prefix.
        const s3Key = `songs/${req.file.filename}`;

        try {
            // Upload the temporary local file to S3.
            const fileBuffer = await fs.readFile(req.file.path);

            await s3.send(
                new PutObjectCommand({
                    Bucket: S3_BUCKET_NAME,
                    Key: s3Key,
                    Body: fileBuffer,
                    ContentType: req.file.mimetype || 'audio/mpeg'
                })
            );

            // Save the S3 object key in PostgreSQL.
            const result = await pool.query(
                `
                INSERT INTO Songs (title, filePath, uploadingUser)
                VALUES ($1, $2, $3)
                RETURNING songId AS "songId"
                `,
                [title, s3Key, uploadingUser]
            );

            // Remove the temporary local file after both operations succeed.
            await fs.unlink(req.file.path);

            return res.status(201).json({
                message: 'File successfully uploaded',
                songId: result.rows[0].songId,
                filename: req.file.filename
            });
        } catch (error) {
            console.error(
                'Specific error on S3 or database upload attempt:',
                error
            );

            // Clean up the temporary local file if it exists.
            try {
                await fs.unlink(req.file.path);
            } catch (cleanupError: any) {
                if (cleanupError.code !== 'ENOENT') {
                    console.error(
                        'Upload failed and temporary file cleanup also failed:',
                        cleanupError
                    );
                }
            }

            return res.status(500).json({
                error: 'Could not upload song'
            });
        }
    }
);

// Get songs uploaded by the authenticated user
router.get('/', requireAuth, async (req, res) => {
    const uploadingUser = req.session.userId;

    try {
        const result = await pool.query(
            `
            SELECT
                songId AS "songId",
                title,
                filePath AS "filePath"
            FROM Songs
            WHERE uploadingUser = $1
            ORDER BY songId
            `,
            [uploadingUser]
        );

        res.status(200).json({
            songs: result.rows
        });
    } catch (error) {
        console.error(
            'Database error fetching tracks for user:',
            error
        );

        res.status(500).json({
            error: 'Could not fetch songs from database'
        });
    }
});

//Signed URL generator for played song
router.get('/:id/play', requireAuth, async (req, res) => {
    const songId = req.params.id;
    const uploadingUser = req.session.userId;

    try {
        const result = await pool.query(
            `
            SELECT
                filePath AS "filePath"
            FROM Songs
            WHERE songId = $1
             AND uploadingUser = $2
            `,
            [songId, uploadingUser]
        );

        const song = result.rows[0] as 
            | { filePath: string}
            | undefined;

        if (!song) {
            return res.status(404).json({
                error: 'Song not found or not authorized'
            });
        }

        const signedUrl = await getSignedUrl(
            s3,
            new GetObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: song.filePath
            }),
            {
                expiresIn: 60 * 15
            }
        );

        return res.status(200).json({
            url: signedUrl
        });
    } catch (error) {
        console.error('Error generating playback URL:', error);

        return res.status(500).json({
            error: 'Could not generate playback URL'
        });
    }
});

// Delete a song owned by the authenticated user
router.delete('/:id', requireAuth, async (req, res) => {
    const songId = req.params.id;
    const uploadingUser = req.session.userId;

    try {
        // Find song and verify ownership
        const selectResult = await pool.query(
            `
            SELECT
                filePath AS "filePath"
            FROM Songs
            WHERE songId = $1
              AND uploadingUser = $2
            `,
            [songId, uploadingUser]
        );

        const song = selectResult.rows[0] as
            | { filePath: string }
            | undefined;

        if (!song) {
            return res.status(404).json({
                error: 'Song not found or not authorized'
            });
        }

        // Delete the object from private S3
        await s3.send(
            new DeleteObjectCommand({
                Bucket: S3_BUCKET_NAME,
                Key: song.filePath
            })
        );

        // Delete the record from Aurora PostgreSQL
        const deleteResult = await pool.query(
            `
            DELETE FROM Songs
            WHERE songId = $1
              AND uploadingUser = $2
            `,
            [songId, uploadingUser]
        );

        if (deleteResult.rowCount === 0) {
            return res.status(400).json({
                error: 'Could not remove song record from database'
            });
        }

        return res.status(200).json({
            message: 'Song deleted'
        });
    } catch (error) {
        console.error(
            'Error deleting song from S3 or PostgreSQL:',
            error
        );

        return res.status(500).json({
            error: 'Could not delete song'
        });
    }
});

export default router;