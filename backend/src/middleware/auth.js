import jwt from 'jsonwebtoken';
import config from '../utils/config.js';

const JWT_SECRET = process.env.JWT_SECRET || 'trellin-secret-key';

// Development bypass middleware
export const devBypass = (req, res, next) => {
  if (config.nodeEnv === 'development') {
    // Create a mock user for development with proper UUID
    req.user = {
      id: '69c33993-c9b7-420c-9489-1afe25b71c38', // Actual user ID from seeded data
      email: 'dev@trellin.com',
      role: 'admin',
      name: 'Development User'
    };
    return next();
  }
  next();
};

// Middleware to verify JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Combined middleware for development bypass or token authentication
export const authenticateTokenOrDev = (req, res, next) => {
  // First try development bypass
  if (config.nodeEnv === 'development') {
    req.user = {
      id: '69c33993-c9b7-420c-9489-1afe25b71c38', // Actual user ID from seeded data
      email: 'dev@trellin.com',
      role: 'admin',
      name: 'Development User'
    };
    return next();
  }
  
  // Otherwise use normal token authentication
  return authenticateToken(req, res, next);
};

// Middleware to check if user is admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      role: user.role || 'admin',
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};
