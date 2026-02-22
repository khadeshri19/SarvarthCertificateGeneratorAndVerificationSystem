import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth.middlewares';
import { roleMiddleware } from '../middlewares/role.middlewares';
import * as adminController from '../controllers/admin.controllers';

const router = Router();

// All admin routes require auth + admin role
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

router.post('/create-user', adminController.createUser);
router.delete('/delete-user/:id', adminController.deleteUser);
router.get('/users', adminController.getAllUsers);
router.get('/certificates', adminController.getAllCertificates);
router.patch('/certificates/:id/status', adminController.updateCertificateStatus);
router.put('/reset-password/:id', adminController.resetUserPassword);

export default router;
