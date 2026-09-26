import 'dotenv/config';
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

async function testPostgresConnection() {
    try {
        await client.connect();

        const result = await client.query(`
            SELECT
                NOW() AS current_time,
                current_database() AS database_name,
                current_user AS database_user
        `);

        console.log('PostgreSQL connection succeeded:', result.rows[0]);
    } catch (error) {
        console.error('PostgreSQL connection failed:', error);
        process.exitCode = 1;
    } finally {
        await client.end().catch(() => {});
    }
}

testPostgresConnection();