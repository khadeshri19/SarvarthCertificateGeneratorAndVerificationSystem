import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.services';

export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required.' });
            return;
        }

        const result = await loginUser(email, password);
        res.json(result);
    } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'Invalid email or password') {
            res.status(401).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
};

export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password || !role) {
            res.status(400).json({ error: 'Name, email, password, and role are required.' });
            return;
        }

        if (!['admin', 'user'].includes(role)) {
            res.status(400).json({ error: 'Role must be admin or user.' });
            return;
        }

        const user = await registerUser(name, email, password, role);
        res.status(201).json({ user });
    } catch (error: any) {
        console.error('Register error:', error);
        if (error.message === 'Email already exists.') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
};
