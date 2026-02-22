import pool from '../script/pool.script';
import { User } from '../models/auth.models';

export const findUserByEmail = async (email: string): Promise<User | null> => {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
};

export const createUser = async (name: string, email: string, passwordHash: string, role: string): Promise<User> => {
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [name, email, passwordHash, role]
    );
    return result.rows[0];
};
