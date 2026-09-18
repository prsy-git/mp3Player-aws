import 'dotenv/config';
import pool from '../archive/postgres.js';
async function checkUsers() {
    try {
        const result = await pool.query(`
            SELECT
                userid,
                username,
                email
            FROM users
            ORDER BY userid DESC;
        `);
        console.table(result.rows);
    }
    catch (error) {
        console.error('Failed to query PostgreSQL users:', error);
        process.exitCode = 1;
    }
    finally {
        await pool.end();
    }
}
checkUsers();
