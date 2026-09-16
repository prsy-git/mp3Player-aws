import pg from 'pg';
import { Signer } from '@aws-sdk/rds-signer';

const { Pool } = pg;

const region = process.env.AWS_REGION || 'us-west-2';
const host = process.env.RDS_HOST;
const port = Number(process.env.RDS_PORT || 5432);
const user = process.env.RDS_USER || 'postgres';
const database = process.env.RDS_DATABASE || 'postgres';

if (!host) {
    throw new Error('RDS_HOST env var not configured');
}

const pool = new Pool({
    host,
    port,
    user,
    database,
    ssl: {
        rejectUnauthorized: false
    },
    password: async () => {
        const signer = new Signer({
            region,
            hostname: host,
            port,
            username: user
        });

        return signer.getAuthToken();
    },
    max: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 30000,
});

export default pool;