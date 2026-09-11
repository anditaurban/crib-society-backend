import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.use(authenticate, requireRole('owner'));

router.get('/summary', DashboardController.getSummary);
router.get('/sales', DashboardController.getSales);

export default router;
