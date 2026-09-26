import { Router } from 'express';
import bcrypt from 'bcrypt';
import { PoolClient } from 'pg';
import pool from '../db/postgres.js';

const router = Router();

router.post('/register-user', async (req, res) => {
    const { username, userPassword, email } = req.body;

    if (!username || !userPassword) {
        return res.status(400).json({
            error: 'Username and password not provided and are required.'
        });
    }

    let client: PoolClient | undefined;

    try {
        client = await pool.connect();

        await client.query('BEGIN');

        const hashedPassword = await bcrypt.hash(userPassword, 12);

        const userResult = await client.query(
            `
            INSERT INTO Users (username, passwordHash, email)
            VALUES ($1, $2, $3)
            RETURNING userId, username
            `,
            [username, hashedPassword, email || null]
        );

        const newUser = userResult.rows[0];

        await client.query(
            `
            INSERT INTO Playlists (name, userId)
            VALUES ($1, $2)
            `,
            ['Favorites', newUser.userid]
        );

        await client.query('COMMIT');

        return res.status(201).json({
            message: 'User created successfully',
            userId: newUser.userid,
            username: newUser.username
        });
    } catch (error: any) {
    if (client) {
        await client.query('ROLLBACK');
    }

    console.error('Specific PostgreSQL registration error:', error);

    if (error.code === '23505') {
        return res.status(409).json({
            error: 'Username or email already exists. Please choose another username.'
        });
    }

    return res.status(500).json({
        error: 'Server error occurred.'
    });
    } finally {
        if (client) {
            client.release();
        }
    }
});

interface PassCheckInfo {
    username: string;
    passwordhash: string;
    userid: number;
}

router.post('/validate-login', async (req, res) => {
    const { username, userPassword } = req.body;

    if (!username || !userPassword) {
        return res.status(400).json({
            error: 'Username and password are required.'
        });
    }

    try {
        const result = await pool.query<PassCheckInfo>(
            `
            SELECT username, passwordHash, userId
            FROM Users
            WHERE username = $1
            `,
            [username]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        const samePass = await bcrypt.compare(
            userPassword,
            user.passwordhash
        );

        if (!samePass) {
            return res.status(401).json({
                error: 'Invalid username or password.'
            });
        }

        req.session.userId = user.userid;

        return res.status(200).json({
            message: 'Information validated; logging in.',
            userId: user.userid
        });
    } catch (error) {
        console.error('Specific PostgreSQL login error:', error);

        return res.status(500).json({
            error: 'Server error occurred.'
        });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                error: 'Unable to destroy session.'
            });
        }
        
        res.clearCookie('connect.sid');

        return res.status(200).json({
            message: 'Session deleted successfully.'
        });
    });
});

router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({
            error: 'Session not authenticated'
        });
    }

    return res.json({
        message: 'Session active',
        userId: req.session.userId
    });
});

export default router;