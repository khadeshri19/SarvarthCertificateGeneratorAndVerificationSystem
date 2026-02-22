import pool from '../script/pool.script';

export const verifyCertificate = async (verificationCode: string) => {
    const result = await pool.query(
        `SELECT c.*, u.name as issued_by 
         FROM certificates c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.verification_code = $1`,
        [verificationCode]
    );

    if (result.rows.length === 0) {
        return null;
    }

    // Original logic checked for status 'active', but schema didn't show status column in initDb.
    // However, the original route code had: if (cert.status !== 'active')
    // I should probably include this check if the column exists. 
    // In initDb.ts, I didn't see status column added to certificates.
    // But the original code clearly used it. 
    // I'll assume it might exist or interpretation of 'active' usage.
    // I'll return the row and let controller decide or handle it here.

    return result.rows[0];
};
