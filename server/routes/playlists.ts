import { Router } from 'express';
import db from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/', requireAuth, (req, res) => {
    const playlistName = req.body.name;
    const userId = req.session.userId;

    if (!playlistName || playlistName.trim() === '') {
        return res.status(400).json({ error: 'Nonempty playlist name required' });
    }

    try {
        const query = `
            INSERT INTO Playlists (name, userId)
            VALUES (?, ?)
        `;

        const statement = db.prepare(query)
        const result = statement.run(playlistName, userId);

        res.status(201).json({
            messsage: 'Playlist created for user successfully',
            playlistId: result.lastInsertRowid,
            name: playlistName
        });
    } catch (error: any) {

        console.error(' Specific playlist create error:', error);
        res.status(500).json({ error: 'Server error occured.' });

    }
});

router.get('/', requireAuth, (req, res) => {
    const uploadingUser = req.session.userId;

    try {

        const query = `
            SELECT
                pl.playlistId,
                pl.name AS playlistName,
                s.songId,
                s.title,
                s.filePath,
                ps.position
            FROM Playlists pl
            LEFT JOIN Playlists_Songs ps ON pl.playlistId = ps.playlistId
            LEFT JOIN Songs s ON ps.songId = s.songId
            WHERE pl.userId = ?
        `

        //Type interface for row from SQL JOIN
        interface PlaylistRow {
            playlistId: number,
            playlistName: string,
            songId: number | null,
            title: string | null,
            filePath: string | null,
            position: number | null
        }

        const statement = db.prepare(query);
        const rows = statement.all(uploadingUser) as PlaylistRow[];

        //Map to nested array for react structure
        const playlistMap = new Map();

        for (const row of rows) {

            if (!playlistMap.has(row.playlistId)) {
                playlistMap.set(row.playlistId, {
                    id: row.playlistId,
                    name: row.playlistName,
                    songs: []
                });
            }

            if (row.songId !== null) {
                playlistMap.get(row.playlistId)!.songs.push({
                    id: row.songId,
                    title: row.title,
                    filePath: row.filePath,
                    position: row.position
                });
            }
        }

        const formattedPlaylists = Array.from(playlistMap.values());

        res.status(200).json({ playlists: formattedPlaylists });

    } catch (error) {
        console.error('Specific error when fetching playlists:', error);
        res.status(500).json({ error: 'Could not fetch playlists from database '});
    }
});

router.post('/:id/songs', requireAuth, (req, res) => {
    const playlistId = req.params.id
    const { songId } = req.body
    const userId = req.session.userId

    if (!songId) {
        return res.status(400).json({ error: 'songId needed to execute' });
    }

    try {
        const checkQuery = `
            SELECT playlistId FROM Playlists
            WHERE playlistId = ? AND userId = ?
        `;
        const playlist = db.prepare(checkQuery).get(playlistId, userId);

        if (!playlist) {
            return res.status(400).json({ error: 'Playlist not found or user not authenticated properly '});
        }

        const positioningQuery = `
            SELECT COUNT(*) as count FROM Playlists_Songs WHERE playlistId = ?
        `;
        const result = db.prepare(positioningQuery).get(playlistId) as {count : number};
        const nextPosition = result.count + 1;

        const insertQuery = `
            INSERT INTO Playlists_Songs (playlistId, songId, position)
            VALUES (?, ?, ?)
        `;
        db.prepare(insertQuery).run(playlistId, songId, nextPosition);

        res.status(201).json({ message: 'Song added to playlist successfully' });
    } catch (error: any) {
        if (error.code === `SQLITE_CONSTRAINT_PRIMARYKEY`) {
            return res.status(400).json({ error: 'Song already exists in this playlist' });
        }

        console.error('Error adding song to playlist:', error);
        res.status(500).json({ error: 'Could not add song to playlist' });
    }
});

router.delete('/:id', requireAuth, (req, res) => {
    const playlistId = req.params.id;
    const userId = req.session.userId;

    try {
        const query = `
            DELETE FROM Playlists
            WHERE playlistId = ? AND userId = ?
        `

        const result = db.prepare(query).run(playlistId, userId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Playlist not found or user not authorized to delete playlist' })
        }

        res.status(200).json({ message: 'Playlist successfully deleted' });
    } catch (error) {
        console.error('Specific error deleting playlist:', error);
        res.status(500).json({ error: 'Could not delete playlist' });
    }
})

router.delete('/:id/songs/:songId', requireAuth, (req, res) => {
    const playlistId = req.params.id;
    const songId = req.params.songId;
    const userId = req.session.userId;

    try {
        const checkQuery = `
            SELECT playlistId FROM Playlists
            WHERE playlistId = ? AND userId = ?
        `;
        const playlist = db.prepare(checkQuery).get(playlistId, userId);

        if (!playlist) {
            return res.status(404).json({ error: 'Playlist not found or unauthorized' })
        }

        const deleteQuery = `
            DELETE From Playlists_Songs
            WHERE PlaylistId = ? AND SongId = ?
        `

        const result = db.prepare(deleteQuery).run(playlistId, songId);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Song not found in playlist' });
        }

        res.status(200).json({ message: 'Song removed from playlist successfully' })
    } catch (error) {
        console.error('Error removing song from playlist:', error);
        res.status(500).json({ error: 'Could not remove song from playlist' });
    }
})

export default router;
