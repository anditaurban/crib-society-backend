import { Router } from 'express';
import { StaffController } from '../controllers/staffController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('owner'));

router.get('/', StaffController.getStaff);
router.post('/', StaffController.createStaff);
router.put('/:id', StaffController.updateStaff);
router.patch('/:id/status', StaffController.updateStatus);

export default router;
