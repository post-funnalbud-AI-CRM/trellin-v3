import express from 'express';
import { 
  analyzeEmail, 
  analyzeCustomerSentiment, 
  analyzeEmployeePerformance, 
  generateDailySummary,
  analyzeTaskPriority 
} from '../services/aiService.js';

const router = express.Router();

// Analyze a single email
router.post('/analyze-email', async (req, res) => {
  try {
    const { subject, body, fromEmail, toEmail, timestamp } = req.body;
    
    if (!subject || !body || !fromEmail || !toEmail) {
      return res.status(400).json({ 
        error: 'Missing required fields: subject, body, fromEmail, toEmail' 
      });
    }

    const emailData = {
      subject,
      body,
      fromEmail,
      toEmail,
      timestamp: timestamp || new Date().toISOString()
    };

    const analysis = await analyzeEmail(emailData);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Email analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze email',
      details: error.message 
    });
  }
});

// Analyze customer sentiment based on email history
router.post('/analyze-customer-sentiment', async (req, res) => {
  try {
    const { customerId, emails } = req.body;
    
    if (!customerId || !emails || !Array.isArray(emails)) {
      return res.status(400).json({ 
        error: 'Missing required fields: customerId, emails (array)' 
      });
    }

    const analysis = await analyzeCustomerSentiment(emails);
    
    res.json({
      success: true,
      customerId,
      data: analysis
    });
  } catch (error) {
    console.error('Customer sentiment analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze customer sentiment',
      details: error.message 
    });
  }
});

// Analyze employee performance
router.post('/analyze-employee-performance', async (req, res) => {
  try {
    const { 
      name, 
      totalTasks, 
      completedTasks, 
      avgResponseTime, 
      customerSatisfaction, 
      isActive 
    } = req.body;
    
    if (!name || totalTasks === undefined || completedTasks === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: name, totalTasks, completedTasks' 
      });
    }

    const employeeData = {
      name,
      totalTasks,
      completedTasks,
      avgResponseTime: avgResponseTime || 0,
      customerSatisfaction: customerSatisfaction || 0,
      isActive: isActive !== undefined ? isActive : true
    };

    const analysis = await analyzeEmployeePerformance(employeeData);
    
    res.json({
      success: true,
      employeeName: name,
      data: analysis
    });
  } catch (error) {
    console.error('Employee performance analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze employee performance',
      details: error.message 
    });
  }
});

// Generate daily summary
router.post('/generate-daily-summary', async (req, res) => {
  try {
    const { 
      totalCustomers, 
      happyCustomers, 
      unhappyCustomers, 
      openTasks, 
      overdueTasks, 
      flaggedIssues 
    } = req.body;
    
    if (totalCustomers === undefined || happyCustomers === undefined || unhappyCustomers === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: totalCustomers, happyCustomers, unhappyCustomers' 
      });
    }

    const summaryData = {
      totalCustomers,
      happyCustomers,
      unhappyCustomers,
      openTasks: openTasks || 0,
      overdueTasks: overdueTasks || 0,
      flaggedIssues: flaggedIssues || 0
    };

    const summary = await generateDailySummary(summaryData);
    
    res.json({
      success: true,
      data: {
        summary,
        metrics: summaryData
      }
    });
  } catch (error) {
    console.error('Daily summary generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate daily summary',
      details: error.message 
    });
  }
});

// Analyze task priority
router.post('/analyze-task-priority', async (req, res) => {
  try {
    const { 
      description, 
      customerName, 
      customerSentiment, 
      dueDate, 
      type 
    } = req.body;
    
    if (!description || !customerName) {
      return res.status(400).json({ 
        error: 'Missing required fields: description, customerName' 
      });
    }

    const taskData = {
      description,
      customerName,
      customerSentiment: customerSentiment || 'neutral',
      dueDate: dueDate || null,
      type: type || 'general'
    };

    const analysis = await analyzeTaskPriority(taskData);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Task priority analysis error:', error);
    res.status(500).json({ 
      error: 'Failed to analyze task priority',
      details: error.message 
    });
  }
});

// Health check for AI service
router.get('/health', async (req, res) => {
  try {
    // Test the AI service with a simple prompt
    const testData = {
      subject: 'Test email',
      body: 'This is a test email for health check',
      fromEmail: 'test@example.com',
      toEmail: 'support@example.com',
      timestamp: new Date().toISOString()
    };

    await analyzeEmail(testData);
    
    res.json({
      success: true,
      message: 'AI service is healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({ 
      error: 'AI service is not healthy',
      details: error.message 
    });
  }
});

export default router;
