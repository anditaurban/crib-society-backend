/**
 * Middleware to enforce role-based access control (RBAC)
 * @param {...string} allowedRoles - Allowed roles: 'owner', 'staff', 'guest'
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required before verifying permissions.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]. Your role is "${req.user.role}".`
      });
    }

    next();
  };
}
