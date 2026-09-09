import {Request, Response, NextFunction} from 'express';

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.session || !req.session.userId) {
        return res.status(401).json({ error: 'Unauthorized request. Please log in to a user account first.'})
    }

    //Otherwise user authenticated
    next();
}