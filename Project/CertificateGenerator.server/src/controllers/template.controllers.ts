import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middlewares';
import * as templateService from '../services/template.services';

export const uploadTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'Template image file is required.' });
            return;
        }

        const name = req.body.name || 'Untitled Template';
        const template = await templateService.uploadTemplate(req.user!.id, name, req.file);

        res.status(201).json({ template });
    } catch (error) {
        console.error('Template upload error:', error);
        res.status(500).json({ error: 'Failed to upload template.' });
    }
};

export const getTemplates = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const templates = await templateService.getTemplates(req.user!.id);
        res.json({ templates });
    } catch (error) {
        console.error('Fetch templates error:', error);
        res.status(500).json({ error: 'Failed to fetch templates.' });
    }
};

export const getTemplateDetails = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const result = await templateService.getTemplateDetails(id, req.user!.id);

        if (!result) {
            res.status(404).json({ error: 'Template not found.' });
            return;
        }

        res.json(result);
    } catch (error) {
        console.error('Fetch template error:', error);
        res.status(500).json({ error: 'Failed to fetch template.' });
    }
};

export const saveTemplateFields = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { fields } = req.body;

        if (!Array.isArray(fields) || fields.length === 0) {
            res.status(400).json({ error: 'Fields array is required.' });
            return;
        }

        const insertedFields = await templateService.saveTemplateFields(id, req.user!.id, fields);
        res.status(201).json({ fields: insertedFields });
    } catch (error: any) {
        console.error('Save fields error:', error);
        if (error.message === 'Template not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to save fields.' });
        }
    }
};

export const updateTemplateFields = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { fields, canvas_width, canvas_height } = req.body;

        if (!Array.isArray(fields)) {
            res.status(400).json({ error: 'Fields array is required.' });
            return;
        }

        const result = await templateService.updateTemplateFields(id, req.user!.id, fields, canvas_width, canvas_height);
        res.json(result);
    } catch (error: any) {
        console.error('Update fields error:', error);
        if (error.message === 'Template not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: `Failed to update fields: ${error.message}` });
        }
    }
};

export const deleteTemplate = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        await templateService.deleteTemplate(id, req.user!.id);
        res.json({ message: 'Template deleted successfully.' });
    } catch (error: any) {
        console.error('Delete template error:', error);
        if (error.message === 'Template not found') {
            res.status(404).json({ error: error.message });
        } else {
            res.status(500).json({ error: 'Failed to delete template.' });
        }
    }
};
