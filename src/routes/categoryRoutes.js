import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Public / POS read access
router.get('/', CategoryController.getCategories);

// Owner-only modifications
router.post('/', authenticate, requireRole('owner'), CategoryController.createCategory);
router.put('/:id', authenticate, requireRole('owner'), CategoryController.updateCategory);
router.delete('/:id', authenticate, requireRole('owner'), CategoryController.deleteCategory);

export default router;
