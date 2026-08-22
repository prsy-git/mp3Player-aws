import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
})