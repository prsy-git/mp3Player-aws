import 'dotenv/config';
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
async function testRdsConnection() {
    try {
        await client.connect();
        const result = await client.query(`
            SELECT
                NOW() AS current_time,
                current_database() AS database_name,
                current_user AS database_user
        `);
        console.log('New RDS connection succeeded:', result.rows[0]);
    }
    catch (error) {
        console.error('New RDS connection failed:', error);
        process.exitCode = 1;
    }
    finally {
        await client.end().catch(() => { });
    }
}
testRdsConnection();
