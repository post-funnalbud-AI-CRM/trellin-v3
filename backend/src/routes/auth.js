import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, authenticateToken } from '../middleware/auth.js';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import config from '../utils/config.js';

const router = express.Router();

// Initialize admin user if not exists
const initializeAdminUser = async () => {
  try {
    const existingAdmin = await db.select().from(users).where(eq(users.email, 'admin@trellin.com'));
    
    if (existingAdmin.length === 0) {
      // Create admin user
      const hashedPassword = await bcrypt.hash('admin', 10);
      await db.insert(users).values({
        name: 'Admin User',
        email: 'admin@trellin.com',
        companyName: 'Trellin Admin'
      });
      console.log('✅ Admin user created successfully');
    }
  } catch (error) {
    console.error('Error initializing admin user:', error);
  }
};

// Initialize admin user on startup
initializeAdminUser();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Find user by email (username)
    const user = await db.select().from(users).where(eq(users.email, username));
    
    if (user.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    const userData = user[0];
    
    // For now, check if it's admin user with hardcoded password
    // In production, you'd store hashed passwords in the database
    if (userData.email === 'admin@trellin.com' && password === 'admin') {
      // Generate JWT token
      const token = generateToken({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: 'admin'
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: userData.id,
            email: userData.email,
            name: userData.name,
            role: 'admin'
          },
          token
        }
      });
    } else {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: error.message
    });
  }
});

// Verify token endpoint
router.get('/verify', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: {
      user: req.user,
      valid: true
    }
  });
});

// Development login endpoint (no authentication required)
router.post('/dev-login', (req, res) => {
  if (config.nodeEnv === 'development') {
    const token = generateToken({
      id: '69c33993-c9b7-420c-9489-1afe25b71c38', // Actual user ID from seeded data
      email: 'dev@trellin.com',
      name: 'Development User',
      role: 'admin'
    });

    res.json({
      success: true,
      message: 'Development login successful',
      data: {
        user: {
          id: '69c33993-c9b7-420c-9489-1afe25b71c38', // Actual user ID from seeded data
          email: 'dev@trellin.com',
          name: 'Development User',
          role: 'admin'
        },
        token
      }
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Development endpoint not available in production'
    });
  }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user.id));
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user[0].id,
          email: user[0].email,
          name: user[0].name,
          role: 'admin'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user',
      message: error.message
    });
  }
});

export default router;
