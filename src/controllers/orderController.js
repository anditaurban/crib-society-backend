import { pool } from '../config/db.js';
import { OrderService } from '../services/orderService.js';

export class OrderController {
  /**
   * GET /api/orders
   * Query: status, date, page, limit, search
   */
  static async getOrders(req, res, next) {
    try {
      const { status, date, search, page = 1, limit = 20 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
      const offset = (pageNum - 1) * limitNum;

      const conditions = [];
      const params = [];

      // Role check: Staff can view today's orders by default if no date specified
      if (req.user?.role === 'staff' && !date) {
        conditions.push('DATE(o.created_at) = CURDATE()');
      } else if (date) {
        conditions.push('DATE(o.created_at) = ?');
        params.push(date);
      }

      if (status) {
        conditions.push('o.order_status = ?');
        params.push(status);
      }

      if (search) {
        conditions.push('(o.order_number LIKE ? OR o.customer_name LIKE ?)');
        const searchVal = `%${search.trim()}%`;
        params.push(searchVal, searchVal);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count
      const [countResult] = await pool.query(
        `SELECT COUNT(o.id) as total FROM orders o ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      // Fetch orders
      const [orders] = await pool.query(
        `SELECT 
          o.id, o.order_number AS orderNumber, o.user_id AS cashierId, u.name AS cashierName,
          o.customer_name AS customerName, o.customer_phone AS customerPhone,
          o.subtotal, o.discount_amount AS discount, o.tax_amount AS tax, o.service_amount AS service,
          o.total_amount AS total, o.payment_method AS paymentMethod, o.payment_status AS paymentStatus,
          o.order_status AS orderStatus, o.notes, o.paid_at AS paidAt, o.completed_at AS completedAt,
          o.created_at AS createdAt
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         ${whereClause}
         ORDER BY o.id DESC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      // Attach item summary for each order if needed
      if (orders.length > 0) {
        const orderIds = orders.map((o) => o.id);
        const [items] = await pool.query(
          `SELECT order_id, product_id, product_name, unit_price, quantity, subtotal_price, notes
           FROM order_items
           WHERE order_id IN (?)`,
          [orderIds]
        );

        const itemsByOrder = new Map();
        for (const item of items) {
          if (!itemsByOrder.has(item.order_id)) {
            itemsByOrder.set(item.order_id, []);
          }
          itemsByOrder.get(item.order_id).push({
            productId: item.product_id,
            productName: item.product_name,
            unitPrice: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal_price,
            notes: item.notes
          });
        }

        for (const o of orders) {
          o.items = itemsByOrder.get(o.id) || [];
        }
      }

      res.status(200).json({
        success: true,
        data: orders,
        meta: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders
   * Create POS / Customer Order
   */
  static async createOrder(req, res, next) {
    try {
      const {
        items,
        paymentMethod = 'cash',
        customerName = 'Guest',
        customerPhone = null,
        notes = null,
        cashReceived = null,
        referenceNo = null
      } = req.body;

      const order = await OrderService.createOrder({
        userId: req.user?.id || null,
        items,
        paymentMethod,
        customerName,
        customerPhone,
        notes,
        cashReceived,
        referenceNo
      });

      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   */
  static async getOrderById(req, res, next) {
    try {
      const { id } = req.params;

      const [orders] = await pool.query(
        `SELECT 
          o.id, o.order_number AS orderNumber, o.user_id AS cashierId, u.name AS cashierName,
          o.customer_name AS customerName, o.customer_phone AS customerPhone,
          o.subtotal, o.discount_amount AS discount, o.tax_amount AS tax, o.service_amount AS service,
          o.total_amount AS total, o.payment_method AS paymentMethod, o.payment_status AS paymentStatus,
          o.order_status AS orderStatus, o.notes, o.paid_at AS paidAt, o.completed_at AS completedAt,
          o.cancelled_at AS cancelledAt, o.created_at AS createdAt
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.id = ?
         LIMIT 1`,
        [id]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Order #${id} not found.`
        });
      }

      const order = orders[0];

      // Fetch items
      const [items] = await pool.query(
        `SELECT id, product_id AS productId, product_name AS productName, unit_price AS unitPrice,
                quantity, subtotal_price AS subtotal, notes
         FROM order_items
         WHERE order_id = ?`,
        [id]
      );
      order.items = items;

      // Fetch payments
      const [payments] = await pool.query(
        `SELECT id, payment_method AS paymentMethod, amount_due AS amountDue,
                amount_paid AS amountPaid, change_amount AS changeAmount, reference_no AS referenceNo,
                status, created_at AS createdAt
         FROM payments
         WHERE order_id = ?`,
        [id]
      );
      order.payments = payments;

      // Fetch logs
      const [logs] = await pool.query(
        `SELECT l.id, l.previous_status AS previousStatus, l.new_status AS newStatus,
                l.reason, l.created_at AS createdAt, u.name AS changedByName
         FROM order_status_logs l
         LEFT JOIN users u ON l.user_id = u.id
         WHERE l.order_id = ?
         ORDER BY l.id ASC`,
        [id]
      );
      order.statusLogs = logs;

      res.status(200).json({
        success: true,
        order
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/orders/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!status) {
        return res.status(400).json({
          success: false,
          message: 'Target status is required.'
        });
      }

      const result = await OrderService.updateOrderStatus({
        orderId: id,
        newStatus: status,
        reason,
        userId: req.user?.id || null,
        userRole: req.user?.role || 'staff'
      });

      res.status(200).json({
        success: true,
        message: `Order status successfully updated to "${status}".`,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
}
