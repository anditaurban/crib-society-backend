import { pool } from '../config/db.js';

export class DashboardController {
  /**
   * GET /api/dashboard/summary
   * Response: { salesToday, ordersToday, averageOrderValue, lowStockCount }
   */
  static async getSummary(req, res, next) {
    try {
      // 1. Calculate salesToday, ordersToday, averageOrderValue
      const [orderStats] = await pool.query(
        `SELECT 
          COALESCE(SUM(total_amount), 0) AS salesToday,
          COUNT(id) AS ordersToday
         FROM orders
         WHERE order_status = 'completed'
           AND DATE(created_at) = CURDATE()`
      );

      const salesToday = parseFloat(orderStats[0]?.salesToday || 0);
      const ordersToday = parseInt(orderStats[0]?.ordersToday || 0, 10);
      const averageOrderValue = ordersToday > 0 ? Math.round(salesToday / ordersToday) : 0;

      // 2. Calculate lowStockCount
      const [stockStats] = await pool.query(
        `SELECT COUNT(id) AS lowStockCount
         FROM products
         WHERE status = 'active'
           AND deleted_at IS NULL
           AND stock <= low_stock_threshold`
      );

      const lowStockCount = parseInt(stockStats[0]?.lowStockCount || 0, 10);

      res.status(200).json({
        success: true,
        data: {
          salesToday,
          ordersToday,
          averageOrderValue,
          lowStockCount
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/dashboard/sales
   * Query: period = 'today' | '7days' | '30days' | 'monthly' | 'yearly'
   */
  static async getSales(req, res, next) {
    try {
      const { period = '7days' } = req.query;

      let dateCondition = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
      let groupBy = 'DATE(o.created_at)';
      let selectDate = 'DATE(o.created_at) AS date';

      switch (period) {
        case 'today':
          dateCondition = 'DATE(o.created_at) = CURDATE()';
          groupBy = 'HOUR(o.created_at)';
          selectDate = 'CONCAT(HOUR(o.created_at), ":00") AS date';
          break;
        case '7days':
          dateCondition = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)';
          groupBy = 'DATE(o.created_at)';
          selectDate = 'DATE(o.created_at) AS date';
          break;
        case '30days':
          dateCondition = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)';
          groupBy = 'DATE(o.created_at)';
          selectDate = 'DATE(o.created_at) AS date';
          break;
        case 'monthly':
          dateCondition = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)';
          groupBy = 'DATE_FORMAT(o.created_at, "%Y-%m")';
          selectDate = 'DATE_FORMAT(o.created_at, "%Y-%m") AS date';
          break;
        case 'yearly':
          dateCondition = 'o.created_at >= DATE_SUB(CURDATE(), INTERVAL 5 YEAR)';
          groupBy = 'YEAR(o.created_at)';
          selectDate = 'YEAR(o.created_at) AS date';
          break;
      }

      const [rows] = await pool.query(
        `SELECT 
          ${selectDate},
          COALESCE(SUM(o.total_amount), 0) AS totalSales,
          COUNT(o.id) AS totalOrders
         FROM orders o
         WHERE o.order_status = 'completed' AND ${dateCondition}
         GROUP BY ${groupBy}
         ORDER BY date ASC`
      );

      res.status(200).json({
        success: true,
        period,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }
}
