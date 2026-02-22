import bcrypt from 'bcrypt';
import * as adminRepo from '../repository/admin.repository';
import { registerUser } from './auth.services';

export const createUser = async (name: string, email: string, password: string, role: string) => {
    // Reuse auth service logic which handles hashing and duplication check
    return await registerUser(name, email, password, role);
};

export const deleteUser = async (id: string, currentUserId: string) => {
    if (id === currentUserId) {
        throw new Error('Cannot delete your own account.');
    }
    const user = await adminRepo.deleteUser(id);
    if (!user) {
        throw new Error('User not found.');
    }
    return user;
};

export const getAllUsers = async () => {
    return await adminRepo.getAllUsers();
};

export const getAllCertificates = async () => {
    return await adminRepo.getAllCertificates();
};

export const updateCertificateStatus = async (id: string, status: string) => {
    const cert = await adminRepo.updateCertificateStatus(id, status);
    if (!cert) {
        throw new Error('Certificate not found.');
    }
    return cert;
};

export const resetUserPassword = async (id: string, password: string) => {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await adminRepo.resetUserPassword(id, hashedPassword);
    if (!user) {
        throw new Error('User not found.');
    }
    return user;
};
