/**
 * Authentication & Authorization Middleware
 * Handles JWT verification and role-based access control
 */

const jwt = require('jsonwebtoken');
const { ApiError } = require('./error.middleware');
const User = require('../models/User.model');

/**
 * Protect routes - Verify JWT token
 * Attaches user object to request if token is valid
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return next(
        new ApiError(401, 'Not authorized to access this route. Please log in')
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (exclude password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return next(new ApiError(401, 'User no longer exists'));
      }

      // Check if user is active
      if (!req.user.isActive) {
        return next(new ApiError(401, 'Your account has been deactivated'));
      }

      next();
    } catch (error) {
      return next(new ApiError(401, 'Not authorized to access this route'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize user roles
 * Checks if authenticated user has required role(s)
 * @param  {...string} roles - Allowed roles (admin, manager, editor, user)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          `User role '${req.user.role}' is not authorized to access this route`
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication
 * Attaches user if token is valid, but doesn't fail if no token
 * Useful for routes that have different behavior for authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');
      } catch (error) {
        // Token invalid, but we don't throw error - just continue without user
        req.user = null;
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth,
};
