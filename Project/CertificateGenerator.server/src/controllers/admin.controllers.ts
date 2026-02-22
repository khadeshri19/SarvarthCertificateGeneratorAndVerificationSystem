import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import * as adminService from '../services/admin.services';

export const createUser = async (req: AuthRequest, res: Response): Promise<void> => {
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

        const user = await adminService.createUser(name, email, password, role);
        res.status(201).json({ user });
    } catch (error: any) {
        console.error('Create user error:', error);
        if (error.message === 'Email already exists.') {
            res.status(409).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to create user.' });
        }
    }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const user = await adminService.deleteUser(id, req.user!.id);
        res.json({ message: 'User deleted successfully.', user });
    } catch (error: any) {
        console.error('Delete user error:', error);
        if (error.message === 'Cannot delete your own account.') {
            res.status(400).json({ error: error.message });
        } else if (error.message === 'User not found.') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to delete user.' });
        }
    }
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const users = await adminService.getAllUsers();
        res.json({ users });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

export const getAllCertificates = async (_req: AuthRequest, res: Response): Promise<void> => {
    try {
        const certificates = await adminService.getAllCertificates();
        res.json({ certificates });
    } catch (error) {
        console.error('Fetch all certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates.' });
    }
};

export const updateCertificateStatus = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { status } = req.body;

        if (!['active', 'disabled'].includes(status)) {
            res.status(400).json({ error: 'Status must be active or disabled.' });
            return;
        }

        const certificate = await adminService.updateCertificateStatus(id, status);
        res.json({ certificate });
    } catch (error: any) {
        console.error('Update certificate status error:', error);
        if (error.message === 'Certificate not found.') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to update certificate status.' });
        }
    }
};

export const resetUserPassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { password } = req.body;

        if (!password || password.length < 6) {
            res.status(400).json({ error: 'Password must be at least 6 characters.' });
            return;
        }

        const user = await adminService.resetUserPassword(id, password);
        res.json({ message: 'Password reset successfully.', user });
    } catch (error: any) {
        console.error('Reset password error:', error);
        if (error.message === 'User not found.') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to reset password.' });
        }
    }
};
