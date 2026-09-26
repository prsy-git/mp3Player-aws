import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import pool from './db/postgres.js';

const app = express();
app.set('trust proxy', 1);

const PORT = Number(process.env.PORT || 8080);

async function testPostgresConnection() {
    try {
        const result = await pool.query(`
            SELECT
                NOW() AS current_time,
                current_database() AS database_name,
                current_user AS database_user    
        `);

        console.log('PostgreSQL connection succeeded', result.rows[0]);
    } catch (error) {
        console.error('PostgreSQL connection failed:', error);
        process.exit(1);
    }
}

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

const PgSession = connectPgSimple(session);

app.use(
    session({
        store: new PgSession({
            pool,
            tableName: 'user_sessions',
            createTableIfMissing: true,
        }),
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            httpOnly: true,
            sameSite: 'lax',
            secure: true,
        }
    })
);

//--- SQL Route Imports
import userRoutes from './routes/users-postgres.js';
import songRoutes from './routes/songs-postgres.js';
import playlistRoutes from './routes/playlists-postgres.js';

//GET To confirm backend is running
app.get('/', (req, res) =>  {
    res.send('MP3 backend working')
});

//Test api ping
app.get('/api/ping', (req, res) => {
    res.json({status: 'ok', message: 'backend functioning'});
});


//--- SQL DATABASE ROUTES ---
app.use('/api/users', userRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

async function startServer() {
    await testPostgresConnection();

    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
}

startServer();