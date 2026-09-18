import { Router } from 'express';
import pool from '../db/rds-postgres.js';
import { requireAuth } from '../middleware/auth.js';
const router = Router();
router.post('/', requireAuth, async (req, res) => {
    const playlistName = req.body.name;
    const userId = req.session.userId;
    if (!playlistName || playlistName.trim() === '') {
        return res.status(400).json({
            error: 'Nonempty playlist name required'
        });
    }
    try {
        const result = await pool.query(`
            INSERT INTO Playlists (name, userId)
            VALUES ($1, $2)
            RETURNING playlistId, name
            `, [playlistName.trim(), userId]);
        const playlist = result.rows[0];
        return res.status(201).json({
            messsage: 'Playlist created for user successfully',
            playlistId: playlist.playlistid,
            name: playlist.name
        });
    }
    catch (error) {
        console.error('Specific playlist create error:', error);
        return res.status(500).json({
            error: 'Server error occured.'
        });
    }
});
router.get('/', requireAuth, async (req, res) => {
    const userId = req.session.userId;
    try {
        const result = await pool.query(`
            SELECT
                pl.playlistId,
                pl.name AS playlistName,
                s.songId,
                s.title,
                s.filePath,
                ps.position
            FROM Playlists pl
            LEFT JOIN Playlists_Songs ps
                ON pl.playlistId = ps.playlistId
            LEFT JOIN Songs s
                ON ps.songId = s.songId
            WHERE pl.userId = $1
            ORDER BY pl.playlistId, ps.position
            `, [userId]);
        const rows = result.rows;
        const playlistMap = new Map();
        for (const row of rows) {
            if (!playlistMap.has(row.playlistid)) {
                playlistMap.set(row.playlistid, {
                    id: row.playlistid,
                    name: row.playlistname,
                    songs: []
                });
            }
            if (row.songid !== null) {
                playlistMap.get(row.playlistid).songs.push({
                    id: row.songid,
                    title: row.title,
                    filePath: row.filepath,
                    position: row.position
                });
            }
        }
        const formattedPlaylists = Array.from(playlistMap.values());
        return res.status(200).json({
            playlists: formattedPlaylists
        });
    }
    catch (error) {
        console.error('Specific error when fetching playlists:', error);
        return res.status(500).json({
            error: 'Could not fetch playlists from database'
        });
    }
});
router.post('/:id/songs', requireAuth, async (req, res) => {
    const playlistId = req.params.id;
    const { songId } = req.body;
    const userId = req.session.userId;
    if (!songId) {
        return res.status(400).json({
            error: 'songId needed to execute'
        });
    }
    try {
        const playlistResult = await pool.query(`
            SELECT playlistId
            FROM Playlists
            WHERE playlistId = $1 AND userId = $2
            `, [playlistId, userId]);
        if (playlistResult.rows.length === 0) {
            return res.status(400).json({
                error: 'Playlist not found or user not authenticated properly'
            });
        }
        const songResult = await pool.query(`
            SELECT songId
            FROM Songs
            WHERE songId = $1 AND uploadingUser = $2
            `, [songId, userId]);
        if (songResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Song not found or authorization not complete'
            });
        }
        const positionResult = await pool.query(`
            SELECT COUNT(*)::int AS count
            FROM Playlists_Songs
            WHERE playlistId = $1
            `, [playlistId]);
        const nextPosition = positionResult.rows[0].count + 1;
        await pool.query(`
            INSERT INTO Playlists_Songs (playlistId, songId, position)
            VALUES ($1, $2, $3)
            `, [playlistId, songId, nextPosition]);
        return res.status(201).json({
            message: 'Song added to playlist successfully'
        });
    }
    catch (error) {
        if (error.code === '23505') {
            return res.status(400).json({
                error: 'Song already exists in this playlist'
            });
        }
        console.error('Error adding song to playlist:', error);
        return res.status(500).json({
            error: 'Could not add song to playlist'
        });
    }
});
router.delete('/:id', requireAuth, async (req, res) => {
    const playlistId = req.params.id;
    const userId = req.session.userId;
    try {
        const result = await pool.query(`
            DELETE FROM Playlists
            WHERE playlistId = $1 AND userId = $2
            `, [playlistId, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: 'Playlist not found or user not authorized to delete playlist'
            });
        }
        return res.status(200).json({
            message: 'Playlist successfully deleted'
        });
    }
    catch (error) {
        console.error('Specific error deleting playlist:', error);
        return res.status(500).json({
            error: 'Could not delete playlist'
        });
    }
});
router.delete('/:id/songs/:songId', requireAuth, async (req, res) => {
    const playlistId = req.params.id;
    const songId = req.params.songId;
    const userId = req.session.userId;
    try {
        const playlistResult = await pool.query(`
            SELECT playlistId
            FROM Playlists
            WHERE playlistId = $1 AND userId = $2
            `, [playlistId, userId]);
        if (playlistResult.rows.length === 0) {
            return res.status(404).json({
                error: 'Playlist not found or unauthorized'
            });
        }
        const result = await pool.query(`
            DELETE FROM Playlists_Songs
            WHERE playlistId = $1 AND songId = $2
            `, [playlistId, songId]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: 'Song not found in playlist'
            });
        }
        return res.status(200).json({
            message: 'Song removed from playlist successfully'
        });
    }
    catch (error) {
        console.error('Error removing song from playlist:', error);
        return res.status(500).json({
            error: 'Could not remove song from playlist'
        });
    }
});
export default router;
