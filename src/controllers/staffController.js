import bcrypt from 'bcryptjs';
import { pool } from '../config/db.js';

export class StaffController {
  /**
   * GET /api/staff (Owner only)
   */
  static async getStaff(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT id, name, email, role, status, avatar_url AS avatarUrl, created_at AS createdAt
         FROM users
         WHERE deleted_at IS NULL
         ORDER BY id ASC`
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
   * POST /api/staff (Owner only)
   */
  static async createStaff(req, res, next) {
    try {
      const { name, email, password, role = 'staff', status = 'active', avatarUrl = null } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and password are required.'
        });
      }

      // Check unique email
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND deleted_at IS NULL LIMIT 1',
        [email.trim().toLowerCase()]
      );

      if (existing.length > 0) {
        return res.status(409).json({
          success: false,
          message: `User with email "${email}" already exists.`
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const [result] = await pool.query(
        `INSERT INTO users (name, email, password, role, status, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [name.trim(), email.trim().toLowerCase(), hashedPassword, role, status, avatarUrl]
      );

      res.status(201).json({
        success: true,
        message: 'Staff member created successfully',
        data: {
          id: result.insertId,
          name,
          email,
          role,
          status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/staff/:id (Owner only)
   */
  static async updateStaff(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, password, role, status, avatarUrl } = req.body;

      const [existing] = await pool.query(
        'SELECT id FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: `Staff user #${id} not found.`
        });
      }

      const updates = [];
      const params = [];

      if (name !== undefined) {
        updates.push('name = ?');
        params.push(name.trim());
      }

      if (email !== undefined) {
        // Check uniqueness if email changed
        const [emailExists] = await pool.query(
          'SELECT id FROM users WHERE email = ? AND id != ? AND deleted_at IS NULL LIMIT 1',
          [email.trim().toLowerCase(), id]
        );
        if (emailExists.length > 0) {
          return res.status(409).json({
            success: false,
            message: `Email "${email}" is already used by another account.`
          });
        }
        updates.push('email = ?');
        params.push(email.trim().toLowerCase());
      }

      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        updates.push('password = ?');
        params.push(hashedPassword);
      }

      if (role !== undefined) {
        updates.push('role = ?');
        params.push(role);
      }

      if (status !== undefined) {
        updates.push('status = ?');
        params.push(status);
      }

      if (avatarUrl !== undefined) {
        updates.push('avatar_url = ?');
        params.push(avatarUrl);
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
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        params
      );

      res.status(200).json({
        success: true,
        message: 'Staff updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/staff/:id/status (Owner only)
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Status must be either "active" or "inactive".'
        });
      }

      // Prevent owner from deactivating themselves
      if (parseInt(id, 10) === req.user?.id) {
        return res.status(400).json({
          success: false,
          message: 'You cannot deactivate your own administrative account.'
        });
      }

      const [result] = await pool.query(
        'UPDATE users SET status = ?, updated_at = NOW() WHERE id = ? AND deleted_at IS NULL',
        [status, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: `Staff user #${id} not found.`
        });
      }

      res.status(200).json({
        success: true,
        message: `Staff status updated to "${status}".`
      });
    } catch (error) {
      next(error);
    }
  }
}
