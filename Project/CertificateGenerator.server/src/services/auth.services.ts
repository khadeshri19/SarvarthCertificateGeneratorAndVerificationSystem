import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../repository/auth.repository';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.config';
import { AuthResponse } from '../models/auth.models';

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
    const user = await findUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password');
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
        throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        },
    };
};

export const registerUser = async (name: string, email: string, password: string, role: string): Promise<AuthResponse['user']> => {
    const existing = await findUserByEmail(email);
    if (existing) {
        throw new Error('Email already exists.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await createUser(name, email, hashedPassword, role);

    return {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
    };
};
