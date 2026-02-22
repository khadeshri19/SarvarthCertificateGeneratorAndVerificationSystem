import { Request, Response } from 'express';
import * as verifyService from '../services/verify.services';

export const verifyCertificate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const cert = await verifyService.verifyCertificate(code as string);

        if (!cert) {
            res.status(404).json({
                verified: false,
                error: 'Certificate not found. Invalid verification code.',
            });
            return;
        }

        // Check status if it exists on the record
        if (cert.status && cert.status !== 'active') {
            res.status(200).json({
                verified: false,
                error: 'This certificate has been revoked or disabled.',
            });
            return;
        }

        res.json({
            verified: true,
            certificate: {
                student_name: cert.student_name,
                course_name: cert.course_name,
                completion_date: cert.completion_date,
                certificate_id: cert.id,
                issued_by: cert.issued_by,
                issue_date: cert.created_at,
            },
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ error: 'Verification failed.' });
    }
};
