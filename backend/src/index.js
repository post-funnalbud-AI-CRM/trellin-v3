import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './utils/config.js';
import { db } from './db/index.js';
import { sql } from 'drizzle-orm';
import usersRouter from './routes/users.js';
import customersRouter from './routes/customers.js';
import authRouter from './routes/auth.js';
import aiRouter from './routes/ai.js';
import insightsRouter from './routes/insights.js';
import topicsRouter from './routes/topics.js';
import { authenticateToken, authenticateTokenOrDev } from './middleware/auth.js';

const app = express();
const PORT = config.port;

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Trellin Backend is running'
  });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    // Simple query to test database connection
    await db.execute(sql`SELECT 1`);
    res.json({ 
      status: 'OK', 
      database: 'Connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      database: 'Disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Auth Routes (public)
app.use('/api/v1/auth', authRouter);

// Protected API Routes
app.use('/api/v1/users', authenticateToken, usersRouter);
app.use('/api/v1/customers', authenticateToken, customersRouter);

// AI Routes (protected)
app.use('/api/v1/ai', authenticateTokenOrDev, aiRouter);

// Insights Routes (development bypass auth, protected in production)
app.use('/api/v1/insights', authenticateTokenOrDev, insightsRouter);

// Topics Routes (protected)
app.use('/api/v1/topics', authenticateTokenOrDev, topicsRouter);

// API Info endpoint
app.get('/api/v1', (req, res) => {
  res.json({ 
    message: 'Trellin API v1',
    endpoints: {
      health: '/health',
      dbHealth: '/health/db',
      users: '/api/v1/users',
      customers: '/api/v1/customers',
      employees: '/api/v1/employees',
      tasks: '/api/v1/tasks',
      projects: '/api/v1/projects',
      emails: '/api/v1/emails',
      summaries: '/api/v1/summaries',
      ai: '/api/v1/ai',
      insights: '/api/v1/insights',
      topics: '/api/v1/topics'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Trellin Backend running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database health: http://localhost:${PORT}/health/db`);
});

export default app;
