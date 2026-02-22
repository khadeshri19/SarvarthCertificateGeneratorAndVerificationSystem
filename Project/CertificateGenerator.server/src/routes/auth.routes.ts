import { Router } from 'express';
import { login, register } from '../controllers/auth.controllers';
import { authMiddleware } from '../middlewares/auth.middlewares';
import { roleMiddleware } from '../middlewares/role.middlewares';

const router = Router();

router.post('/login', login);
router.post('/register', authMiddleware, roleMiddleware('admin'), register);

export default router;
