import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

/**
 * Middleware to require a valid JWT token
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed token.'
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'crib_society_super_secret_jwt_key_2026_gen_z';

    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authentication token.'
      });
    }

    // Verify user exists and is active in database
    const [rows] = await pool.query(
      'SELECT id, name, email, role, status FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1',
      [decoded.id]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'User account no longer exists.'
      });
    }

    const user = rows[0];
    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the owner.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Optional authentication middleware for endpoints accessible to guests and users
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'crib_society_super_secret_jwt_key_2026_gen_z';

    try {
      const decoded = jwt.verify(token, secret);
      const [rows] = await pool.query(
        'SELECT id, name, email, role, status FROM users WHERE id = ? AND status = "active" AND deleted_at IS NULL LIMIT 1',
        [decoded.id]
      );
      if (rows.length > 0) {
        req.user = rows[0];
      } else {
        req.user = null;
      }
    } catch (e) {
      req.user = null;
    }
    next();
  } catch (error) {
    next(error);
  }
}
