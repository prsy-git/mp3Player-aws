import pg from 'pg';
const { Pool } = pg;
const pool = new Pool({
    host: process.env.NEW_RDS_HOST,
    port: Number(process.env.NEW_RDS_PORT || 5432),
    user: process.env.NEW_RDS_USER || 'postgres',
    password: process.env.NEW_RDS_PASSWORD,
    database: process.env.NEW_RDS_DATABASE || 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000
});
export default pool;
