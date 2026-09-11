import { pool } from '../config/db.js';

export class ProductController {
  /**
   * GET /api/products
   * Query params: search, category, status, page, limit
   */
  static async getProducts(req, res, next) {
    try {
      const { search, category, status, page = 1, limit = 50 } = req.query;

      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
      const offset = (pageNum - 1) * limitNum;

      const conditions = ['p.deleted_at IS NULL'];
      const params = [];

      if (search) {
        conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
        const searchPattern = `%${search.trim()}%`;
        params.push(searchPattern, searchPattern);
      }

      if (category) {
        // can be categoryId or slug
        if (!isNaN(category)) {
          conditions.push('p.category_id = ?');
          params.push(parseInt(category, 10));
        } else {
          conditions.push('c.slug = ?');
          params.push(category);
        }
      }

      if (status) {
        conditions.push('p.status = ?');
        params.push(status);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total items
      const [countResult] = await pool.query(
        `SELECT COUNT(p.id) AS total
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ${whereClause}`,
        params
      );
      const total = countResult[0]?.total || 0;

      // Select data with category name
      const [rows] = await pool.query(
        `SELECT 
          p.id, p.category_id AS categoryId, c.name AS categoryName, c.slug AS categorySlug,
          p.name, p.slug, p.description, p.price, p.cost_price AS costPrice,
          p.stock, p.low_stock_threshold AS lowStockThreshold, p.image_url AS image,
          p.status, (p.stock <= p.low_stock_threshold) AS isLowStock,
          p.created_at AS createdAt, p.updated_at AS updatedAt
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         ${whereClause}
         ORDER BY p.id ASC
         LIMIT ? OFFSET ?`,
        [...params, limitNum, offset]
      );

      res.status(200).json({
        success: true,
        data: rows,
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
   * GET /api/products/:id
   */
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      const [rows] = await pool.query(
        `SELECT 
          p.id, p.category_id AS categoryId, c.name AS categoryName,
          p.name, p.slug, p.description, p.price, p.cost_price AS costPrice,
          p.stock, p.low_stock_threshold AS lowStockThreshold, p.image_url AS image,
          p.status, p.created_at AS createdAt, p.updated_at AS updatedAt
         FROM products p
         LEFT JOIN categories c ON p.category_id = c.id
         WHERE p.id = ? AND p.deleted_at IS NULL
         LIMIT 1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Product #${id} not found.`
        });
      }

      res.status(200).json({
        success: true,
        data: rows[0]
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/products (Owner only)
   */
  static async createProduct(req, res, next) {
    try {
      const {
        name,
        categoryId,
        price,
        costPrice = 0,
        stock = 0,
        lowStockThreshold = 5,
        image = null,
        description = null,
        status = 'active'
      } = req.body;

      if (!name || !categoryId || price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Product name, categoryId, and price are required.'
        });
      }

      // Check category existence
      const [catRows] = await pool.query('SELECT id FROM categories WHERE id = ? LIMIT 1', [categoryId]);
      if (catRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid categoryId ${categoryId}. Category does not exist.`
        });
      }

      // Generate slug
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      // Check uniqueness
      const [existing] = await pool.query(
        'SELECT id FROM products WHERE (name = ? OR slug = ?) AND deleted_at IS NULL LIMIT 1',
        [name.trim(), slug]
      );
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: `A product with the name "${name}" already exists.`
        });
      }

      const [result] = await pool.query(
        `INSERT INTO products (
          category_id, name, slug, description, price, cost_price,
          stock, low_stock_threshold, image_url, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          categoryId,
          name.trim(),
          slug,
          description || null,
          parseFloat(price) || 0.0,
          parseFloat(costPrice) || 0.0,
          parseInt(stock, 10) || 0,
          parseInt(lowStockThreshold, 10) || 5,
          image || null,
          status
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: {
          id: result.insertId,
          name,
          slug,
          categoryId,
          price: parseFloat(price),
          stock: parseInt(stock, 10),
          status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/products/:id (Owner only)
   */
  static async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const {
        name,
        categoryId,
        price,
        costPrice,
        stock,
        lowStockThreshold,
        image,
        description,
        status
      } = req.body;

      const [existing] = await pool.query(
        'SELECT id FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Product #${id} not found.`
        });
      }

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name.trim());
        const slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
        updates.push('slug = ?');
        params.push(slug);
      }

      if (categoryId !== undefined) {
        updates.push('category_id = ?');
        params.push(categoryId);
      }

      if (price !== undefined) {
        updates.push('price = ?');
        params.push(parseFloat(price));
      }

      if (costPrice !== undefined) {
        updates.push('cost_price = ?');
        params.push(parseFloat(costPrice));
      }

      if (stock !== undefined) {
        updates.push('stock = ?');
        params.push(parseInt(stock, 10));
      }

      if (lowStockThreshold !== undefined) {
        updates.push('low_stock_threshold = ?');
        params.push(parseInt(lowStockThreshold, 10));
      }

      if (image !== undefined) {
        updates.push('image_url = ?');
        params.push(image);
      }

      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }

      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields provided for update.'
        });
      }

      updates.push('updated_at = NOW()');
      params.push(id);

      await pool.query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      res.status(200).json({
        success: true,
        message: 'Product updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/products/:id (Owner only - Soft Delete)
   */
  static async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;

      const [existing] = await pool.query(
        'SELECT id, name FROM products WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [id]
      );
      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Product #${id} not found.`
        });
      }

      // Soft delete to maintain transaction history
      await pool.query(
        'UPDATE products SET status = "archived", deleted_at = NOW() WHERE id = ?',
        [id]
      );

      res.status(200).json({
        success: true,
        message: `Product "${existing[0].name}" archived successfully.`
      });
    } catch (error) {
      next(error);
    }
  }
}
