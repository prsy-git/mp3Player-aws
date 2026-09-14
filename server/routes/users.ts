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

        const registerUser = db.transaction(() => {
            const statement = db.prepare(query);
            const result = statement.run(username, hashedPassword, email || null);
        

        //On registration, instantiate the Favorites playlist on database for persistence
        const createFavQuery = `
            INSERT INTO Playlists (name, userId)
            VALUES (?, ?)
        `;
        db.prepare(createFavQuery).run('Favorites', result.lastInsertRowid);

        return result;
        })

        const result = registerUser();

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

//--- Temp interface for performing password check ---
interface passCheckInfo {
    username: string;
    passwordHash: string;
    userId: number;
}

router.post('/validate-login', async (req, res) => {
    const { username, userPassword } = req.body;
    
    try {
        const query = `
            SELECT username, passwordHash, userId
            FROM Users
            WHERE username = ?;
        `;

        const statement = db.prepare(query);
        
        const result = statement.get(username) as passCheckInfo | undefined;

        if (!result) {
            return res.status(401).json({ error: 'Invalid username or password.'})
        }
        
        const samePass: boolean = await bcrypt.compare(userPassword, result.passwordHash);

        if (!samePass) {
            return res.status(401).json({ error: 'Invalid username or password.'})
        } else {
            req.session.userId = result.userId
            res.status(201).json({
                message: 'Information validated; logging in.'
            })
        } 

    } catch (error: any) {
        console.error(" Specific registration error:", error);
        res.status(500).json({ error: 'Server error occured. '});
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Unable to wipe session from database store '})
        }

        res.clearCookie('connect.sid');
        return res.status(200).json({ message: 'Session deleted from database store '})
    })
})

//Auth check
router.get('/me', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Session not authenticated' });
    }

    res.json({
        message: 'Session active',
        userId: req.session.userId
    });
});

export default router;