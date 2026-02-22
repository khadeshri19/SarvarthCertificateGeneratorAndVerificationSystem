import { Router } from 'express';
import * as verifyController from '../controllers/verify.controllers';

const router = Router();

router.get('/:code', verifyController.verifyCertificate);

export default router;
