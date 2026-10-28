const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const { mockUsers } = require('../data/mockData');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'staffsync_super_secret_jwt_key_2026_modern_hrms'
      );

      // Try database lookup if connected
      if (mongoose.connection.readyState === 1) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (dbErr) {
          // Fall through to mock lookup
        }
      }

      // Fallback to mock users if not found or DB not connected
      if (!req.user) {
        req.user = mockUsers.find((u) => u._id.toString() === decoded.id.toString());
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User no longer exists',
        });
      }

      if (req.user.status === 'inactive') {
        return res.status(403).json({
          success: false,
          message: 'Your account has been deactivated. Please contact HR.',
        });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware Error]:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, invalid or expired token',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'none'}' is not authorized to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
