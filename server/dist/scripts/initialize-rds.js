import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';
const { Client } = pg;
const client = new Client({
    host: process.env.NEW_RDS_HOST,
    port: Number(process.env.NEW_RDS_PORT || 5432),
    user: process.env.NEW_RDS_USER || 'postgres',
    password: process.env.NEW_RDS_PASSWORD,
    database: process.env.NEW_RDS_DATABASE || 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
    connectionTimeoutMillis: 30000
});
async function initializeRds() {
    const schemaPath = path.resolve(process.cwd(), 'db/schema-rds.sql');
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
        console.log('RDS PostgreSQL schema initialized successfully.');
        console.log('Tables found:', result.rows);
    }
    catch (error) {
        console.error('RDS schema initialization failed:', error);
        process.exitCode = 1;
    }
    finally {
        await client.end().catch(() => { });
    }
}
initializeRds();
