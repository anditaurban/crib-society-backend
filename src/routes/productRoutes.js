import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Public / POS / Staff read access
router.get('/', ProductController.getProducts);
router.get('/:id', ProductController.getProductById);

// Owner-only modifications
router.post('/', authenticate, requireRole('owner'), ProductController.createProduct);
router.put('/:id', authenticate, requireRole('owner'), ProductController.updateProduct);
router.delete('/:id', authenticate, requireRole('owner'), ProductController.deleteProduct);

export default router;
