import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const { Client } = pg;

const client = new Client({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000
});

async function initializePostgres() {
    const schemaPath = path.resolve(
        process.cwd(),
        'db/schema.sql'
    );

    try {
        const schema = await fs.readFile(schemaPath, 'utf8');

        await client.connect();
        await client.query(schema);

        const result = await client.query(`
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
    } catch (error) {
        console.error('PostgreSQL schema initialization failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end().catch(() => {});
    }
}

initializePostgres();