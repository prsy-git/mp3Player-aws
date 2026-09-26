import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
    host: process.env.POSTGRES_HOST,
    port: Number(process.env.POSTGRES_PORT || 5432),
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE || 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000
});

export default pool;