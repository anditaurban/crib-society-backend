import { Router } from 'express';
import { OrderController } from '../controllers/orderController.js';
import { authenticate, optionalAuth } from '../middlewares/authMiddleware.js';
import { requireRole } from '../middlewares/roleMiddleware.js';

const router = Router();

// Order listing (Staff & Owner)
router.get('/', authenticate, requireRole('staff', 'owner'), OrderController.getOrders);

// Order detail & receipt viewing
router.get('/:id', optionalAuth, OrderController.getOrderById);

// Create order (POS cashier or Guest order)
router.post('/', optionalAuth, OrderController.createOrder);

// Status transition (Staff & Owner)
router.patch('/:id/status', authenticate, requireRole('staff', 'owner'), OrderController.updateStatus);

export default router;
