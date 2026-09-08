import {Router} from 'express';
import bcrypt from 'bcrypt';
import db from '../db/db.js';

const router = Router();

router.post('/register-user', async (req, res) => {
    const { username, userPassword, email } = req.body;

    if (!username || !userPassword) {
        return res.status(400).json({ error: 'Username and password not provided and are required. '})
    }

    try {
        const hashedPassword = await bcrypt.hash(userPassword, 12)
        const query = `
            INSERT INTO Users (username, passwordHash, email)
            VALUES (?, ?, ?)
        `;

        const statement = db.prepare(query);
        const result = statement.run(username, hashedPassword, email || null);

        res.status(201).json({
            message: 'User created successfully',
            userId: result.lastInsertRowid,
            username: username
        });
    }   catch (error: any) {

        console.error(" Specific registration error:", error);

        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return res.status(409).json({ error: 'Username or email already exists. Please choose another usename.'})
        }
        res.status(500).json({ error: 'Server error occured. '});
    }
});

export default router;