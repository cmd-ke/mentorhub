// src/middlewares/auth.js
import AppError from '../utils/appError.js';

// Basic auth check: requires a logged-in session
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return next(new AppError('Not authenticated', 401));
  }

  // convenience: attach to req.user
  req.user = req.session.user; // { id, role, name, email? }
  return next();
}

// Role-based authorization middleware
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return next(new AppError('Not authenticated', 401));
    }

    const { role } = req.session.user;
    if (!roles.includes(role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }

    req.user = req.session.user;
    return next();
  };
}