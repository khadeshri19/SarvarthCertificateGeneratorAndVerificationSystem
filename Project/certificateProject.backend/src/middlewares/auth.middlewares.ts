import pool from '../script/pool.script';

export const getAllUsers = async ()=>{
        const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    return result.rows;
}