import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import SqliteStoreInit from 'better-sqlite3-session-store';
import session from 'express-session';
import db from './db/db.js';

const app = express();
const SqliteStore = SqliteStoreInit(session);
const PORT = Number(process.env.PORT || 5000);

app.use(cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
}))
app.use(express.json());

//--- Configuration for session middleware
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error('SESSION_SECRET not configured in .env');
}

app.use(
    session({
        store: new SqliteStore({
            client: db,
            expired: {
                clear: true,
                intervalMs: 900000,
            },
        }),
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
        }
    })
);

//--- SQL Route Imports
import userRoutes from './routes/users.js';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';

//Serve audio files from uploads folder to client tier
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//GET To confirm backend is running
app.get('/', (req, res) =>  {
    res.send('MP3 backend working')
});

//Test api ping
app.get('/api/ping', (req, res) => {
    res.json({status: 'ok', message: 'backend functioning'});
});

//GET to read songs from uploads
app.get('/api/tracks', (req, res) => {
    const songPath = path.join(process.cwd(), 'uploads');

    //read files from directory for collection
    fs.readdir(songPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Could not read files from directory' });
        }

        //Secondary check to ensure only playable files are collected (mp3)
        const songFiles = files.filter(file => file.endsWith('.mp3'));
        
        res.json({ songs: songFiles });
    });
});

//POST for file uploads
// app.post('/api/upload', upload.single('file'), (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({ error: 'No file passed.'})
//     }

//     console.log('File uploaded:', req.file.originalname);
//     res.status(200).json({ message: 'Success', filename: req.file.originalname });
// });

//DELETE for song removal on delete button
app.delete('/api/tracks/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);

    //Remove file at disk location
    fs.unlink(filePath, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Could not delete file. May not exist" });
        }

        res.status(200).json({ message: "File successfully removed from uploads." });
    })
})

//--- SQL DATABASE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})