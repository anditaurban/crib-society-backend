import { withTransaction } from '../config/db.js';
import { getFinancialSettings, calculateOrderTotals, generateOrderNumber } from './calculationService.js';

export class OrderService {
  /**
   * Create a new POS / Customer Order inside an atomic transaction
   */
  static async createOrder({
    userId = null,
    items,
    paymentMethod = 'cash',
    customerName = 'Guest',
    customerPhone = null,
    notes = null,
    cashReceived = null,
    referenceNo = null
  }) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      const err = new Error('Order must contain at least one item.');
      err.statusCode = 400;
      throw err;
    }

    return await withTransaction(async (conn) => {
      // 1. Collect all product IDs
      const productIds = items.map((i) => i.productId);
      const [productRows] = await conn.query(
        `SELECT id, name, price, stock, status 
         FROM products 
         WHERE id IN (?) AND deleted_at IS NULL 
         FOR UPDATE`,
        [productIds]
      );

      const productMap = new Map();
      for (const p of productRows) {
        productMap.set(p.id, p);
      }

      // 2. Validate availability and stock
      const enrichedItems = [];
      for (const item of items) {
        const product = productMap.get(item.productId);
        if (!product) {
          const err = new Error(`Product with ID ${item.productId} was not found or has been removed.`);
          err.statusCode = 404;
          throw err;
        }

        if (product.status !== 'active') {
          const err = new Error(`Product "${product.name}" is currently not active/available.`);
          err.statusCode = 422;
          throw err;
        }

        const requestedQty = parseInt(item.quantity, 10) || 1;
        if (requestedQty < 1) {
          const err = new Error(`Invalid quantity for product "${product.name}". Must be at least 1.`);
          err.statusCode = 400;
          throw err;
        }

        if (product.stock < requestedQty) {
          const err = new Error(
            `Insufficient stock for "${product.name}". Available: ${product.stock}, requested: ${requestedQty}.`
          );
          err.statusCode = 422;
          throw err;
        }

        enrichedItems.push({
          productId: product.id,
          productName: product.name,
          price: Number(product.price),
          quantity: requestedQty,
          notes: item.notes || null
        });
      }

      // 3. Compute calculations
      const settings = await getFinancialSettings(conn);
      const totals = calculateOrderTotals(enrichedItems, 0, settings);

      // 4. Validate Cash Payment if applicable
      let changeAmount = 0;
      let amountPaid = totals.totalAmount;
      let paymentStatus = 'paid';
      let orderStatus = 'processing';
      const paidAt = new Date();

      if (paymentMethod === 'cash') {
        const received = Number(cashReceived);
        if (isNaN(received) || received < totals.totalAmount) {
          const err = new Error(
            `Insufficient cash received. Total is IDR ${totals.totalAmount.toLocaleString('id-ID')}, received: IDR ${(received || 0).toLocaleString('id-ID')}.`
          );
          err.statusCode = 422;
          throw err;
        }
        amountPaid = received;
        changeAmount = received - totals.totalAmount;
      } else if (paymentMethod === 'qris' || paymentMethod === 'debit' || paymentMethod === 'transfer') {
        amountPaid = totals.totalAmount;
        changeAmount = 0;
      }

      // 5. Generate Order Number
      const orderNumber = await generateOrderNumber(conn);

      // 6. Insert Order Header
      const [orderResult] = await conn.query(
        `INSERT INTO orders (
          order_number, user_id, customer_name, customer_phone,
          subtotal, discount_amount, tax_amount, service_amount, total_amount,
          payment_method, payment_status, order_status, notes,
          paid_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          orderNumber,
          userId,
          customerName || 'Guest',
          customerPhone || null,
          totals.subtotal,
          totals.discountAmount,
          totals.taxAmount,
          totals.serviceAmount,
          totals.totalAmount,
          paymentMethod,
          paymentStatus,
          orderStatus,
          notes || null,
          paidAt
        ]
      );

      const orderId = orderResult.insertId;

      // 7. Insert Order Items & Deduct Stock
      for (const item of enrichedItems) {
        const lineSubtotal = item.price * item.quantity;
        await conn.query(
          `INSERT INTO order_items (
            order_id, product_id, product_name, unit_price, quantity, subtotal_price, notes, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [
            orderId,
            item.productId,
            item.productName,
            item.price,
            item.quantity,
            lineSubtotal,
            item.notes
          ]
        );

        // Deduct stock atomically
        await conn.query(
          `UPDATE products 
           SET stock = stock - ? 
           WHERE id = ?`,
          [item.quantity, item.productId]
        );
      }

      // 8. Record Payment Transaction
      await conn.query(
        `INSERT INTO payments (
          order_id, payment_method, amount_due, amount_paid, change_amount, reference_no, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'success', NOW(), NOW())`,
        [
          orderId,
          paymentMethod,
          totals.totalAmount,
          amountPaid,
          changeAmount,
          referenceNo || null
        ]
      );

      // 9. Record Initial Status in Order Status Logs
      await conn.query(
        `INSERT INTO order_status_logs (
          order_id, user_id, previous_status, new_status, reason, created_at
        ) VALUES (?, ?, NULL, ?, 'Order initialized & payment confirmed via POS', NOW())`,
        [orderId, userId, orderStatus]
      );

      // 10. Fetch complete order structure for response & receipt
      return {
        id: orderId,
        orderNumber,
        customerName,
        customerPhone,
        items: enrichedItems.map((i) => ({
          productId: i.productId,
          productName: i.productName,
          unitPrice: i.price,
          quantity: i.quantity,
          subtotal: i.price * i.quantity,
          notes: i.notes
        })),
        pricing: {
          subtotal: totals.subtotal,
          discount: totals.discountAmount,
          tax: totals.taxAmount,
          service: totals.serviceAmount,
          total: totals.totalAmount
        },
        payment: {
          method: paymentMethod,
          status: paymentStatus,
          amountPaid,
          changeAmount,
          referenceNo: referenceNo || null
        },
        orderStatus,
        notes,
        createdAt: new Date().toISOString()
      };
    });
  }

  /**
   * Update Order Status with Business Rules state machine validation
   */
  static async updateOrderStatus({ orderId, newStatus, reason = null, userId = null, userRole = 'staff' }) {
    const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];
    if (!validStatuses.includes(newStatus)) {
      const err = new Error(`Invalid target status "${newStatus}". Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    return await withTransaction(async (conn) => {
      // 1. Fetch current order with row lock
      const [rows] = await conn.query(
        `SELECT id, order_number, order_status 
         FROM orders 
         WHERE id = ? 
         FOR UPDATE`,
        [orderId]
      );

      if (rows.length === 0) {
        const err = new Error(`Order #${orderId} not found.`);
        err.statusCode = 404;
        throw err;
      }

      const order = rows[0];
      const currentStatus = order.order_status;

      // 2. State Machine Rules (BUSINESS-RULES.md Section 5)
      if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        const err = new Error(
          `Order #${order.order_number} is already "${currentStatus}" (terminal state) and cannot be altered.`
        );
        err.statusCode = 422;
        throw err;
      }

      if (currentStatus === newStatus) {
        return { success: true, message: `Order #${order.order_number} is already in status "${newStatus}".`, order };
      }

      // Check transition permissions
      if (newStatus === 'cancelled') {
        if (currentStatus === 'processing' && userRole !== 'owner') {
          // If staff wants to cancel an order already brewing, note reason is required
          if (!reason) {
            const err = new Error('Reason is strictly required to void/cancel an order in progress.');
            err.statusCode = 400;
            throw err;
          }
        }

        // Revert product stock
        const [items] = await conn.query(
          `SELECT product_id, quantity 
           FROM order_items 
           WHERE order_id = ? AND product_id IS NOT NULL`,
          [orderId]
        );

        for (const it of items) {
          await conn.query(
            `UPDATE products 
             SET stock = stock + ? 
             WHERE id = ?`,
            [it.quantity, it.product_id]
          );
        }

        await conn.query(
          `UPDATE orders 
           SET order_status = 'cancelled', cancelled_at = NOW(), updated_at = NOW() 
           WHERE id = ?`,
          [orderId]
        );
      } else if (newStatus === 'completed') {
        await conn.query(
          `UPDATE orders 
           SET order_status = 'completed', completed_at = NOW(), updated_at = NOW() 
           WHERE id = ?`,
          [orderId]
        );
      } else {
        await conn.query(
          `UPDATE orders 
           SET order_status = ?, updated_at = NOW() 
           WHERE id = ?`,
          [newStatus, orderId]
        );
      }

      // Log status transition
      await conn.query(
        `INSERT INTO order_status_logs (
          order_id, user_id, previous_status, new_status, reason, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [orderId, userId, currentStatus, newStatus, reason || `Status updated from ${currentStatus} to ${newStatus}`]
      );

      return {
        id: order.id,
        orderNumber: order.order_number,
        previousStatus: currentStatus,
        newStatus,
        reason: reason || null
      };
    });
  }
}
