import { Router } from 'express';
import db from '../db/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/create', requireAuth, (req, res) => {
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
                p.playlistId,
                p.name AS playlistName,
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
})

export default router;
