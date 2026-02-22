import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import * as certificateService from '../services/certificate.services';
import fs from 'fs';

export const generateCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { template_id, student_name, course_name, completion_date } = req.body;

        if (!template_id || !student_name || !course_name || !completion_date) {
            res.status(400).json({ error: 'template_id, student_name, course_name, and completion_date are required.' });
            return;
        }

        const result = await certificateService.generateSingleCertificate(
            req.user!.id,
            req.user!.role,
            template_id,
            student_name,
            course_name,
            completion_date
        );

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Certificate generation error:', error);
        const errorMessage = error.message || '';

        if (errorMessage.includes('Restricted')) {
            res.status(403).json({ error: errorMessage });
        } else if (errorMessage === 'Template not found.') {
            res.status(404).json({ error: errorMessage });
        } else {
            // Include original error message for easier debugging
            res.status(500).json({ error: errorMessage || 'Failed to generate certificate.' });
        }
    }
};

export const generateBulkCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { template_id } = req.body;

        if (!template_id || !req.file) {
            res.status(400).json({ error: 'template_id and CSV file are required.' });
            return;
        }

        const result = await certificateService.generateBulkCertificates(
            req.user!.id,
            req.user!.role,
            template_id,
            req.file.path
        );

        // Cleanup CSV
        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json(result);
    } catch (error: any) {
        console.error('Bulk generation error:', error);
        // Cleanup CSV if error
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        const errorMessage = error.message || '';

        if (errorMessage.includes('Restricted')) {
            res.status(403).json({ error: errorMessage });
        } else if (errorMessage === 'Template not found.') {
            res.status(404).json({ error: errorMessage });
        } else if (errorMessage.includes('CSV file is empty')) {
            res.status(400).json({ error: errorMessage });
        } else {
            res.status(500).json({ error: errorMessage || 'Failed to generate bulk certificates.' });
        }
    }
};

export const getCertificates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const certificates = await certificateService.getCertificates(req.user!.id);
        res.json({ certificates });
    } catch (error) {
        console.error('Fetch certificates error:', error);
        res.status(500).json({ error: 'Failed to fetch certificates.' });
    }
};

export const getCertificateDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const certificate = await certificateService.getCertificateDetails(id);

        if (!certificate) {
            res.status(404).json({ error: 'Certificate not found.' });
            return;
        }

        res.json({ certificate });
    } catch (error) {
        console.error('Fetch certificate error:', error);
        res.status(500).json({ error: 'Failed to fetch certificate.' });
    }
};

export const downloadCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await certificateService.getCertificatePdfPath(id);

        if (!result) {
            res.status(404).json({ error: 'Certificate PDF not found.' });
            return;
        }

        res.download(result.path, result.filename);
    } catch (error) {
        console.error('Download certificate error:', error);
        res.status(500).json({ error: 'Failed to download certificate.' });
    }
};
