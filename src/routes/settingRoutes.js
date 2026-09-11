import { Router } from 'express';
import { SettingController } from '../controllers/settingController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

router.get('/', SettingController.getSettings);
router.put('/', authenticate, requireRole('owner'), SettingController.updateSettings);

export default router;
