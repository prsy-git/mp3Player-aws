import 'dotenv/config';
import pool from '../db/postgres.js';

async function checkLatestSong() {
    try {
        const result = await pool.query(`
            SELECT
                songId AS "songId",
                title,
                filePath AS "filePath",
                uploadingUser AS "uploadingUser"
            FROM Songs
            ORDER BY songId DESC
            LIMIT 1
        `);

        if (result.rows.length === 0) {
            console.log('No songs found in PostgreSQL.');
            return;
        }

        console.log('Latest song record in Aurora PostgreSQL:');
        console.table(result.rows);
    } catch (error) {
        console.error('Could not query latest song:', error);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
}

checkLatestSong();