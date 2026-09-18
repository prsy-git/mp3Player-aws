import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pool from '../archive/postgres.js';
async function initializePostgres() {
    const schemaPath = path.resolve(process.cwd(), 'db/schema-postgres.sql');
    try {
        const schema = await fs.readFile(schemaPath, 'utf8');
        await pool.query(schema);
        const result = await pool.query(`
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name IN (
                'users',
                'playlists',
                'songs',
                'playlists_songs'
              )
            ORDER BY table_name;
        `);
        console.log('PostgreSQL schema initialized successfully.');
        console.log('Tables found:', result.rows);
    }
    catch (error) {
        console.error('PostgreSQL schema initialization failed:', error);
        process.exitCode = 1;
    }
    finally {
        await pool.end();
    }
}
initializePostgres();
