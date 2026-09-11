import { pool } from '../config/db.js';

export class CategoryController {
  /**
   * GET /api/categories
   */
  static async getCategories(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, slug, description, image_url AS image, sort_order AS sortOrder, is_active AS isActive
         FROM categories
         WHERE is_active = TRUE
         ORDER BY sort_order ASC, name ASC`
      );

      res.status(200).json({
        success: true,
        data: rows
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/categories (Owner only)
   */
  static async createCategory(req, res, next) {
    try {
      const { name, description = null, image = null, sortOrder = 0 } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required.'
        });
      }

      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');

      const [existing] = await pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [slug]);
      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: `Category "${name}" already exists.`
        });
      }

      const [result] = await pool.query(
        `INSERT INTO categories (name, slug, description, image_url, sort_order, is_active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, TRUE, NOW(), NOW())`,
        [name.trim(), slug, description, image, parseInt(sortOrder, 10) || 0]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: {
          id: result.insertId,
          name,
          slug,
          sortOrder: parseInt(sortOrder, 10) || 0
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/categories/:id (Owner only)
   */
  static async updateCategory(req, res, next) {
    try {
      const { id } = req.params;
      const { name, description, image, sortOrder, isActive } = req.body;

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

      if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
      }

      if (image !== undefined) {
        updates.push('image_url = ?');
        params.push(image);
      }

      if (sortOrder !== undefined) {
        updates.push('sort_order = ?');
        params.push(parseInt(sortOrder, 10));
      }

      if (isActive !== undefined) {
        updates.push('is_active = ?');
        params.push(Boolean(isActive));
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
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      res.status(200).json({
        success: true,
        message: 'Category updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/categories/:id (Owner only)
   */
  static async deleteCategory(req, res, next) {
    try {
      const { id } = req.params;

      // Check if products exist under this category
      const [prods] = await pool.query(
        'SELECT id FROM products WHERE category_id = ? AND deleted_at IS NULL LIMIT 1',
        [id]
      );
      if (prods.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Cannot delete category with associated active products. Reassign products first.'
        });
      }

      await pool.query('DELETE FROM categories WHERE id = ?', [id]);

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully.'
      });
    } catch (error) {
      next(error);
    }
  }
}
