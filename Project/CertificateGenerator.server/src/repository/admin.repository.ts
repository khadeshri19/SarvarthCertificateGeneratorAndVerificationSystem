import pool from '../script/pool.script';

export const getAllUsers = async () => {
    const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
};

export const deleteUser = async (id: string) => {
    const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id, name, email',
        [id]
    );
    return result.rows[0];
};

export const getAllCertificates = async () => {
    const result = await pool.query(
        `SELECT c.*, u.name as issued_by 
         FROM certificates c 
         JOIN users u ON c.user_id = u.id 
         ORDER BY c.created_at DESC`
    );
    return result.rows;
};

export const updateCertificateStatus = async (id: string, status: string) => {
    const result = await pool.query(
        'UPDATE certificates SET status = $1 WHERE id = $2 RETURNING *',
        [status, id]
    );
    return result.rows[0];
};

export const resetUserPassword = async (id: string, passwordHash: string) => {
    const result = await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING id, name, email',
        [passwordHash, id]
    );
    return result.rows[0];
};

export const checkUserExists = async (id: string) => {
    // Helper to check existence if needed, or rely on update returning row.
};
