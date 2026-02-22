import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authMiddleware } from '../middlewares/auth.middlewares';
import * as templateController from '../controllers/template.controllers';

const router = Router();

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, path.join(__dirname, '..', '..', 'uploads'));
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `template_${uuidv4()}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const allowed = ['.png', '.jpg', '.jpeg'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PNG and JPG files are allowed.'));
        }
    },
});

router.post('/upload', authMiddleware, upload.single('template'), templateController.uploadTemplate);
router.get('/', authMiddleware, templateController.getTemplates);
router.get('/:id', authMiddleware, templateController.getTemplateDetails);
router.post('/:id/fields', authMiddleware, templateController.saveTemplateFields);
router.put('/:id/fields', authMiddleware, templateController.updateTemplateFields);
router.delete('/:id', authMiddleware, templateController.deleteTemplate);

export default router;
