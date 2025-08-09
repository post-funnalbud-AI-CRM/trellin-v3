import express from 'express';
import { db } from '../db/index.js';
import { emailLogs, emailInsights, customers, employees, users } from '../db/schema.js';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { 
  analyzeCustomerSentiment, 
  generateDailySummary, 
  generateEnhancedDailySummary,
  analyzeQADashboard, 
  analyzeCustomerDetail, 
  analyzeEmployeeDetail,
  performComprehensiveAnalysis
} from '../services/aiService.js';

const router = express.Router();

// Get all email insights for a user
router.get('/emails', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data
    
    const emails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        body: emailLogs.body,
        fromEmail: emailLogs.fromEmail,
        toEmail: emailLogs.toEmail,
        timestamp: emailLogs.timestamp,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary,
        actionNeeded: emailLogs.actionNeeded,
        replied: emailLogs.replied,
        replyTimeMinutes: emailLogs.replyTimeMinutes,
        customerName: customers.name,
        employeeName: employees.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .leftJoin(employees, eq(emailLogs.employeeId, employees.id))
      .where(eq(emailLogs.userId, userId))
      .orderBy(desc(emailLogs.timestamp));

    res.json({
      success: true,
      data: emails
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ 
      error: 'Failed to fetch emails',
      details: error.message 
    });
  }
});

// Get email insights with AI analysis
router.get('/emails/:emailId/insights', async (req, res) => {
  try {
    const { emailId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    const insight = await db
      .select()
      .from(emailInsights)
      .where(and(
        eq(emailInsights.emailId, emailId),
        eq(emailLogs.userId, userId)
      ))
      .leftJoin(emailLogs, eq(emailInsights.emailId, emailLogs.id))
      .limit(1);

    if (insight.length === 0) {
      return res.status(404).json({ error: 'Email insight not found' });
    }

    res.json({
      success: true,
      data: insight[0]
    });
  } catch (error) {
    console.error('Error fetching email insight:', error);
    res.status(500).json({ 
      error: 'Failed to fetch email insight',
      details: error.message 
    });
  }
});

// Get customer sentiment analysis
router.get('/customers/:customerId/sentiment', async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    // Get customer emails
    const customerEmails = await db
      .select({
        timestamp: emailLogs.timestamp,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary
      })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.customerId, customerId),
        eq(emailLogs.userId, userId)
      ))
      .orderBy(desc(emailLogs.timestamp));

    if (customerEmails.length === 0) {
      return res.status(404).json({ error: 'No emails found for customer' });
    }

    // Analyze customer sentiment with AI
    const sentimentAnalysis = await analyzeCustomerSentiment(customerEmails);

    res.json({
      success: true,
      data: {
        customerId,
        emailCount: customerEmails.length,
        analysis: sentimentAnalysis
      }
    });
  } catch (error) {
    console.error('Error analyzing customer sentiment:', error);
    res.status(500).json({ 
      error: 'Failed to analyze customer sentiment',
      details: error.message 
    });
  }
});

// Get dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    // Get counts
    const [emailCount] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(eq(emailLogs.userId, userId));

    const [customerCount] = await db
      .select({ count: count() })
      .from(customers)
      .where(eq(customers.userId, userId));

    const [employeeCount] = await db
      .select({ count: count() })
      .from(employees)
      .where(eq(employees.userId, userId));

    // Get sentiment distribution
    const sentimentStats = await db
      .select({
        sentiment: emailLogs.sentiment,
        count: count()
      })
      .from(emailLogs)
      .where(eq(emailLogs.userId, userId))
      .groupBy(emailLogs.sentiment);

    // Get recent emails
    const recentEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        timestamp: emailLogs.timestamp,
        actionNeeded: emailLogs.actionNeeded,
        customerName: customers.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .where(eq(emailLogs.userId, userId))
      .orderBy(desc(emailLogs.timestamp))
      .limit(10);

    // Get flagged emails
    const flaggedEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        timestamp: emailLogs.timestamp,
        customerName: customers.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .where(and(
        eq(emailLogs.userId, userId),
        eq(emailLogs.actionNeeded, true)
      ))
      .orderBy(desc(emailLogs.timestamp));

    const dashboardData = {
      summary: {
        totalEmails: emailCount.count,
        totalCustomers: customerCount.count,
        totalEmployees: employeeCount.count,
        flaggedEmails: flaggedEmails.length
      },
      sentimentDistribution: sentimentStats,
      recentEmails,
      flaggedEmails
    };

    res.json({
      success: true,
      data: dashboardData
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard data',
      details: error.message 
    });
  }
});

// Get daily summary with AI
router.get('/daily-summary', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [emailCount] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ));

    const sentimentStats = await db
      .select({
        sentiment: emailLogs.sentiment,
        count: count()
      })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ))
      .groupBy(emailLogs.sentiment);

    const [flaggedCount] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        eq(emailLogs.actionNeeded, true),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ));

    // Calculate sentiment counts
    const happyCount = sentimentStats.find(s => s.sentiment === 'happy')?.count || 0;
    const unhappyCount = sentimentStats.find(s => s.sentiment === 'unhappy')?.count || 0;
    const neutralCount = sentimentStats.find(s => s.sentiment === 'neutral')?.count || 0;

    const summaryData = {
      totalCustomers: 5, // Hardcoded for now
      happyCustomers: happyCount,
      unhappyCustomers: unhappyCount,
      openTasks: 0, // TODO: Add task data
      overdueTasks: 0,
      flaggedIssues: flaggedCount.count
    };

    // Generate AI summary
    const aiSummary = await generateDailySummary(summaryData);

    res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        metrics: summaryData,
        summary: aiSummary
      }
    });
  } catch (error) {
    console.error('Error generating daily summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate daily summary',
      details: error.message 
    });
  }
});

// Get customer list with sentiment
router.get('/customers', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    const customersWithSentiment = await db
      .selectDistinctOn([customers.name], {
        id: customers.id,
        name: customers.name,
        primaryDomain: customers.primaryDomain,
        overallSentiment: customers.overallSentiment,
        flaggedIssues: customers.flaggedIssues,
        emailCount: sql`COUNT(${emailLogs.id})`,
        lastEmailDate: sql`MAX(${emailLogs.timestamp})`
      })
      .from(customers)
      .leftJoin(emailLogs, eq(customers.id, emailLogs.customerId))
      .where(eq(customers.userId, userId))
      .groupBy(customers.id, customers.name, customers.primaryDomain, customers.overallSentiment, customers.flaggedIssues)
      .orderBy(customers.name, customers.id);

    res.json({
      success: true,
      data: customersWithSentiment
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customers',
      details: error.message 
    });
  }
});

// Get employee performance data
router.get('/employees', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    const employeesWithStats = await db
      .selectDistinctOn([employees.name], {
        id: employees.id,
        name: employees.name,
        email: employees.email,
        lastActive: employees.lastActive,
        totalTasks: employees.totalTasks,
        completedTasks: employees.completedTasks,
        responsivenessScore: employees.responsivenessScore,
        active: employees.active,
        emailCount: sql`COUNT(${emailLogs.id})`,
        avgReplyTime: sql`AVG(${emailLogs.replyTimeMinutes})`
      })
      .from(employees)
      .leftJoin(emailLogs, eq(employees.id, emailLogs.employeeId))
      .where(eq(employees.userId, userId))
      .groupBy(employees.id, employees.name, employees.email, employees.lastActive, employees.totalTasks, employees.completedTasks, employees.responsivenessScore, employees.active)
      .orderBy(employees.name, employees.id);

    res.json({
      success: true,
      data: employeesWithStats
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ 
      error: 'Failed to fetch employees',
      details: error.message 
    });
  }
});

// Get comprehensive Q&A dashboard analysis - ENHANCED
router.get('/qa-analysis', async (req, res) => {
  try {
    console.log('🚀 Starting Q&A analysis request');
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38'; // Use actual user ID from seeded data

    console.log('📊 Fetching email data...');
    // Get comprehensive email data
    const allEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        body: emailLogs.body,
        fromEmail: emailLogs.fromEmail,
        toEmail: emailLogs.toEmail,
        timestamp: emailLogs.timestamp,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary,
        actionNeeded: emailLogs.actionNeeded,
        replied: emailLogs.replied,
        replyTimeMinutes: emailLogs.replyTimeMinutes,
        customerName: customers.name,
        employeeName: employees.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .leftJoin(employees, eq(emailLogs.employeeId, employees.id))
      .where(eq(emailLogs.userId, userId))
      .orderBy(desc(emailLogs.timestamp));

    console.log(`📧 Found ${allEmails.length} emails`);

    console.log('👥 Fetching customer data...');
    // Get customer data with sentiment
    const customersWithSentiment = await db
      .selectDistinctOn([customers.name], {
        id: customers.id,
        name: customers.name,
        primaryDomain: customers.primaryDomain,
        overallSentiment: customers.overallSentiment,
        flaggedIssues: customers.flaggedIssues,
        emailCount: sql`COUNT(${emailLogs.id})`,
        lastEmailDate: sql`MAX(${emailLogs.timestamp})`
      })
      .from(customers)
      .leftJoin(emailLogs, eq(customers.id, emailLogs.customerId))
      .where(eq(customers.userId, userId))
      .groupBy(customers.id, customers.name, customers.primaryDomain, customers.overallSentiment, customers.flaggedIssues)
      .orderBy(customers.name, customers.id);

    console.log(`👥 Found ${customersWithSentiment.length} customers`);

    console.log('👨‍💼 Fetching employee data...');
    // Get employee performance data
    const employeesWithStats = await db
      .selectDistinctOn([employees.name], {
        id: employees.id,
        name: employees.name,
        email: employees.email,
        role: employees.role,
        lastActive: employees.lastActive,
        totalTasks: employees.totalTasks,
        completedTasks: employees.completedTasks,
        pendingTasks: employees.pendingTasks,
        overdueTasks: employees.overdueTasks,
        responsivenessScore: employees.responsivenessScore,
        active: employees.active,
        emailCount: sql`COUNT(${emailLogs.id})`,
        avgReplyTime: sql`AVG(${emailLogs.replyTimeMinutes})`
      })
      .from(employees)
      .leftJoin(emailLogs, eq(employees.id, emailLogs.employeeId))
      .where(eq(employees.userId, userId))
      .groupBy(employees.id, employees.name, employees.email, employees.role, employees.lastActive, employees.totalTasks, employees.completedTasks, employees.pendingTasks, employees.overdueTasks, employees.responsivenessScore, employees.active)
      .orderBy(employees.name, employees.id);

    console.log(`👨‍💼 Found ${employeesWithStats.length} employees`);

    // Calculate metrics
    const totalEmails = allEmails.length;
    const happyEmails = allEmails.filter(e => e.sentiment === 'happy').length;
    const neutralEmails = allEmails.filter(e => e.sentiment === 'neutral').length;
    const unhappyEmails = allEmails.filter(e => e.sentiment === 'unhappy').length;
    const flaggedIssues = allEmails.filter(e => e.actionNeeded).length;
    const avgReplyTime = allEmails.reduce((sum, email) => {
      return sum + (email.replyTimeMinutes || 0);
    }, 0) / totalEmails;

    // Calculate customer metrics
    const totalCustomers = customersWithSentiment.length;
    const happyCustomers = customersWithSentiment.filter(c => c.overallSentiment === 'happy').length;
    const unhappyCustomers = customersWithSentiment.filter(c => c.overallSentiment === 'unhappy').length;

    // Calculate employee metrics
    const totalEmployees = employeesWithStats.length;
    const activeEmployees = employeesWithStats.filter(e => e.active).length;

    console.log('📈 Calculated metrics:', {
      totalEmails,
      happyEmails,
      neutralEmails,
      unhappyEmails,
      flaggedIssues,
      avgReplyTime,
      totalCustomers,
      happyCustomers,
      unhappyCustomers,
      totalEmployees,
      activeEmployees
    });

    // Prepare data for enhanced AI analysis
    const analysisData = {
      totalEmails,
      happyEmails,
      neutralEmails,
      unhappyEmails,
      flaggedIssues,
      avgReplyTime: Math.round(avgReplyTime * 10) / 10,
      totalCustomers,
      happyCustomers,
      unhappyCustomers,
      totalEmployees,
      activeEmployees,
      customers: customersWithSentiment.map(customer => ({
        name: customer.name,
        emailCount: Number(customer.emailCount) || 0,
        overallSentiment: customer.overallSentiment,
        flaggedIssues: customer.flaggedIssues,
        lastEmailDate: customer.lastEmailDate
      })),
      employees: employeesWithStats.map(employee => ({
        name: employee.name,
        role: employee.role,
        emailCount: Number(employee.emailCount) || 0,
        avgReplyTime: Math.round((Number(employee.avgReplyTime) || 0) * 10) / 10,
        active: employee.active,
        performanceScore: employee.responsivenessScore,
        responsivenessScore: employee.responsivenessScore,
        totalTasks: employee.totalTasks,
        completedTasks: employee.completedTasks
      })),
      recentEmails: allEmails.slice(0, 30).map(email => ({
        timestamp: email.timestamp,
        customerName: email.customerName || 'Unknown',
        employeeName: email.employeeName || 'Unknown',
        subject: email.subject,
        sentiment: email.sentiment,
        summary: email.summary,
        actionNeeded: email.actionNeeded
      }))
    };

    console.log('🤖 Starting AI analysis...');
    // Generate enhanced AI analysis with maximum tokens
    const aiAnalysis = await analyzeQADashboard(analysisData);
    console.log('✅ AI analysis completed');

    console.log('👥 Starting customer detail analysis...');
    // Generate detailed customer analysis with enhanced prompts
    const customerDetails = await Promise.all(
      customersWithSentiment.map(async (customer) => {
        const customerEmails = allEmails.filter(email => email.customerName === customer.name);
        const customerAnalysis = await analyzeCustomerDetail({
          name: customer.name,
          emailCount: Number(customer.emailCount) || 0,
          overallSentiment: customer.overallSentiment,
          flaggedIssues: customer.flaggedIssues,
          lastEmailDate: customer.lastEmailDate,
          recentEmails: customerEmails.slice(0, 15) // Increased for better analysis
        });

        return {
          id: customer.id,
          name: customer.name,
          email: customer.primaryDomain,
          satisfaction: customerAnalysis.satisfaction,
          overallSentiment: customer.overallSentiment,
          happyPoints: customerAnalysis.happyPoints,
          unhappyPoints: customerAnalysis.unhappyPoints,
          activeProjects: customerAnalysis.activeProjects,
          waitingFor: customerAnalysis.waitingFor,
          lastContactDate: customer.lastEmailDate,
          emailCount: Number(customer.emailCount) || 0,
          needsFollowUp: customer.flaggedIssues,
          riskLevel: customerAnalysis.riskLevel
        };
      })
    );
    console.log('✅ Customer analysis completed');

    console.log('👨‍💼 Starting employee analysis...');
    // Generate detailed employee performance analysis with enhanced prompts
    const employeePerformance = await Promise.all(
      employeesWithStats.map(async (employee) => {
        const employeeEmails = allEmails.filter(email => email.employeeName === employee.name);
        const employeeAnalysis = await analyzeEmployeeDetail({
          name: employee.name,
          role: employee.role,
          totalTasks: employee.totalTasks,
          completedTasks: employee.completedTasks,
          pendingTasks: employee.pendingTasks,
          overdueTasks: employee.overdueTasks,
          avgReplyTime: Math.round((Number(employee.avgReplyTime) || 0) * 10) / 10,
          active: employee.active,
          lastActive: employee.lastActive,
          recentEmails: employeeEmails.slice(0, 15) // Increased for better analysis
        });

        return {
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          performanceScore: employeeAnalysis.performanceScore,
          responsivenessScore: employeeAnalysis.responsivenessScore,
          avgResponseTime: Math.round((Number(employee.avgReplyTime) || 0) * 10) / 10,
          totalTasks: employee.totalTasks,
          completedTasks: employee.completedTasks,
          pendingTasks: employee.pendingTasks,
          overdueTasks: employee.overdueTasks,
          active: employee.active,
          lastActive: employee.lastActive,
          strengths: employeeAnalysis.strengths,
          areasForImprovement: employeeAnalysis.areasForImprovement,
          recentActivity: employeeAnalysis.recentActivity,
          customerSatisfaction: employeeAnalysis.customerSatisfaction
        };
      })
    );
    console.log('✅ Employee analysis completed');

    console.log('📤 Sending response...');
    res.json({
      success: true,
      data: {
        metrics: {
          totalEmails,
          happyEmails,
          neutralEmails,
          unhappyEmails,
          flaggedIssues,
          avgReplyTime: Math.round(avgReplyTime * 10) / 10,
          totalCustomers,
          happyCustomers,
          unhappyCustomers,
          totalEmployees,
          activeEmployees
        },
        analysis: aiAnalysis,
        customerDetails,
        employeePerformance,
        lastUpdated: new Date().toISOString()
      }
    });
    console.log('✅ Q&A analysis request completed successfully');
  } catch (error) {
    console.error('❌ Error generating Q&A analysis:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Failed to generate Q&A analysis',
      details: error.message 
    });
  }
});

// Get enhanced daily summary with maximum detail
router.get('/daily-summary-enhanced', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get today's data
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [emailCount] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ));

    const sentimentStats = await db
      .select({
        sentiment: emailLogs.sentiment,
        count: count()
      })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ))
      .groupBy(emailLogs.sentiment);

    const [flaggedCount] = await db
      .select({ count: count() })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.userId, userId),
        eq(emailLogs.actionNeeded, true),
        sql`DATE(${emailLogs.timestamp}) = DATE(${today})`
      ));

    // Calculate sentiment counts
    const happyCount = sentimentStats.find(s => s.sentiment === 'happy')?.count || 0;
    const unhappyCount = sentimentStats.find(s => s.sentiment === 'unhappy')?.count || 0;
    const neutralCount = sentimentStats.find(s => s.sentiment === 'neutral')?.count || 0;

    // Get employee metrics
    const employeesWithStats = await db
      .selectDistinctOn([employees.name], {
        totalTasks: employees.totalTasks,
        completedTasks: employees.completedTasks,
        responsivenessScore: employees.responsivenessScore,
        active: employees.active
      })
      .from(employees)
      .where(eq(employees.userId, userId));

    const avgPerformanceScore = employeesWithStats.length > 0 
      ? employeesWithStats.reduce((sum, emp) => sum + (emp.responsivenessScore || 0), 0) / employeesWithStats.length
      : 0;

    const summaryData = {
      totalCustomers: 5, // Hardcoded for now
      happyCustomers: happyCount,
      unhappyCustomers: unhappyCount,
      openTasks: 0, // TODO: Add task data
      overdueTasks: 0,
      flaggedIssues: flaggedCount.count,
      totalEmployees: employeesWithStats.length,
      activeEmployees: employeesWithStats.filter(e => e.active).length,
      avgPerformanceScore: Math.round(avgPerformanceScore * 10) / 10,
      avgResponsivenessScore: Math.round(avgPerformanceScore * 10) / 10,
      avgResponseTime: 120 // TODO: Calculate from actual data
    };

    // Generate enhanced AI summary with maximum tokens
    const aiSummary = await generateEnhancedDailySummary(summaryData);

    res.json({
      success: true,
      data: {
        date: today.toISOString().split('T')[0],
        metrics: summaryData,
        summary: aiSummary
      }
    });
  } catch (error) {
    console.error('Error generating enhanced daily summary:', error);
    res.status(500).json({ 
      error: 'Failed to generate enhanced daily summary',
      details: error.message 
    });
  }
});

// Get specific customer analysis
router.get('/customers/:customerId/analysis', async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get customer data
    const customer = await db
      .select()
      .from(customers)
      .where(and(
        eq(customers.id, customerId),
        eq(customers.userId, userId)
      ))
      .limit(1);

    if (customer.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    // Get customer emails
    const customerEmails = await db
      .select({
        timestamp: emailLogs.timestamp,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary,
        actionNeeded: emailLogs.actionNeeded,
        replyTimeMinutes: emailLogs.replyTimeMinutes
      })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.customerId, customerId),
        eq(emailLogs.userId, userId)
      ))
      .orderBy(desc(emailLogs.timestamp));

    // Analyze customer detail
    const customerAnalysis = await analyzeCustomerDetail({
      name: customer[0].name,
      emailCount: customerEmails.length,
      overallSentiment: customer[0].overallSentiment,
      flaggedIssues: customer[0].flaggedIssues,
      lastEmailDate: customer[0].lastEmailDate,
      recentEmails: customerEmails.slice(0, 10)
    });

    res.json({
      success: true,
      data: {
        id: customer[0].id,
        name: customer[0].name,
        email: customer[0].primaryDomain,
        satisfaction: customerAnalysis.satisfaction,
        overallSentiment: customer[0].overallSentiment,
        happyPoints: customerAnalysis.happyPoints,
        unhappyPoints: customerAnalysis.unhappyPoints,
        activeProjects: customerAnalysis.activeProjects,
        waitingFor: customerAnalysis.waitingFor,
        lastContactDate: customer[0].lastEmailDate,
        emailCount: customerEmails.length,
        needsFollowUp: customer[0].flaggedIssues,
        riskLevel: customerAnalysis.riskLevel
      }
    });
  } catch (error) {
    console.error('Error analyzing customer:', error);
    res.status(500).json({ 
      error: 'Failed to analyze customer',
      details: error.message 
    });
  }
});

// Get specific employee analysis
router.get('/employees/:employeeId/analysis', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get employee data
    const employee = await db
      .select()
      .from(employees)
      .where(and(
        eq(employees.id, employeeId),
        eq(employees.userId, userId)
      ))
      .limit(1);

    if (employee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Get employee emails
    const employeeEmails = await db
      .select({
        timestamp: emailLogs.timestamp,
        customerName: customers.name,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        replyTimeMinutes: emailLogs.replyTimeMinutes
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .where(and(
        eq(emailLogs.employeeId, employeeId),
        eq(emailLogs.userId, userId)
      ))
      .orderBy(desc(emailLogs.timestamp));

    // Analyze employee detail
    const employeeAnalysis = await analyzeEmployeeDetail({
      name: employee[0].name,
      role: employee[0].role,
      totalTasks: employee[0].totalTasks,
      completedTasks: employee[0].completedTasks,
      pendingTasks: employee[0].pendingTasks,
      overdueTasks: employee[0].overdueTasks,
      avgReplyTime: employee[0].avgReplyTime,
      active: employee[0].active,
      lastActive: employee[0].lastActive,
      recentEmails: employeeEmails.slice(0, 10)
    });

    res.json({
      success: true,
      data: {
        id: employee[0].id,
        name: employee[0].name,
        email: employee[0].email,
        role: employee[0].role,
        performanceScore: employeeAnalysis.performanceScore,
        responsivenessScore: employeeAnalysis.responsivenessScore,
        avgResponseTime: employee[0].avgReplyTime,
        totalTasks: employee[0].totalTasks,
        completedTasks: employee[0].completedTasks,
        pendingTasks: employee[0].pendingTasks,
        overdueTasks: employee[0].overdueTasks,
        active: employee[0].active,
        lastActive: employee[0].lastActive,
        strengths: employeeAnalysis.strengths,
        areasForImprovement: employeeAnalysis.areasForImprovement,
        recentActivity: employeeAnalysis.recentActivity,
        customerSatisfaction: employeeAnalysis.customerSatisfaction
      }
    });
  } catch (error) {
    console.error('Error analyzing employee:', error);
    res.status(500).json({ 
      error: 'Failed to analyze employee',
      details: error.message 
    });
  }
});

// Get comprehensive analysis with maximum tokens and detail
router.get('/comprehensive-analysis', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get comprehensive email data
    const allEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        body: emailLogs.body,
        fromEmail: emailLogs.fromEmail,
        toEmail: emailLogs.toEmail,
        timestamp: emailLogs.timestamp,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary,
        actionNeeded: emailLogs.actionNeeded,
        replied: emailLogs.replied,
        replyTimeMinutes: emailLogs.replyTimeMinutes,
        customerName: customers.name,
        employeeName: employees.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .leftJoin(employees, eq(emailLogs.employeeId, employees.id))
      .where(eq(emailLogs.userId, userId))
      .orderBy(desc(emailLogs.timestamp));

    // Get customer data with sentiment
    const customersWithSentiment = await db
      .selectDistinctOn([customers.name], {
        id: customers.id,
        name: customers.name,
        primaryDomain: customers.primaryDomain,
        overallSentiment: customers.overallSentiment,
        flaggedIssues: customers.flaggedIssues,
        emailCount: sql`COUNT(${emailLogs.id})`,
        lastEmailDate: sql`MAX(${emailLogs.timestamp})`
      })
      .from(customers)
      .leftJoin(emailLogs, eq(customers.id, emailLogs.customerId))
      .where(eq(customers.userId, userId))
      .groupBy(customers.id, customers.name, customers.primaryDomain, customers.overallSentiment, customers.flaggedIssues)
      .orderBy(customers.name, customers.id);

    // Get employee performance data
    const employeesWithStats = await db
      .selectDistinctOn([employees.name], {
        id: employees.id,
        name: employees.name,
        email: employees.email,
        role: employees.role,
        lastActive: employees.lastActive,
        totalTasks: employees.totalTasks,
        completedTasks: employees.completedTasks,
        pendingTasks: employees.pendingTasks,
        overdueTasks: employees.overdueTasks,
        responsivenessScore: employees.responsivenessScore,
        active: employees.active,
        emailCount: sql`COUNT(${emailLogs.id})`,
        avgReplyTime: sql`AVG(${emailLogs.replyTimeMinutes})`
      })
      .from(employees)
      .leftJoin(emailLogs, eq(employees.id, emailLogs.employeeId))
      .where(eq(employees.userId, userId))
      .groupBy(employees.id, employees.name, employees.email, employees.role, employees.lastActive, employees.totalTasks, employees.completedTasks, employees.pendingTasks, employees.overdueTasks, employees.responsivenessScore, employees.active)
      .orderBy(employees.name, employees.id);

    // Calculate comprehensive metrics
    const totalEmails = allEmails.length;
    const happyEmails = allEmails.filter(e => e.sentiment === 'happy').length;
    const neutralEmails = allEmails.filter(e => e.sentiment === 'neutral').length;
    const unhappyEmails = allEmails.filter(e => e.sentiment === 'unhappy').length;
    const flaggedIssues = allEmails.filter(e => e.actionNeeded).length;
    const avgReplyTime = allEmails.reduce((sum, email) => {
      return sum + (email.replyTimeMinutes || 0);
    }, 0) / totalEmails;

    const totalCustomers = customersWithSentiment.length;
    const happyCustomers = customersWithSentiment.filter(c => c.overallSentiment === 'happy').length;
    const unhappyCustomers = customersWithSentiment.filter(c => c.overallSentiment === 'unhappy').length;
    const totalEmployees = employeesWithStats.length;
    const activeEmployees = employeesWithStats.filter(e => e.active).length;

    // Prepare comprehensive data for maximum analysis
    const comprehensiveData = {
      totalEmails,
      happyEmails,
      neutralEmails,
      unhappyEmails,
      flaggedIssues,
      avgReplyTime: Math.round(avgReplyTime * 10) / 10,
      totalCustomers,
      happyCustomers,
      unhappyCustomers,
      totalEmployees,
      activeEmployees,
      customers: customersWithSentiment.map(customer => ({
        name: customer.name,
        emailCount: Number(customer.emailCount) || 0,
        overallSentiment: customer.overallSentiment,
        flaggedIssues: customer.flaggedIssues,
        lastEmailDate: customer.lastEmailDate
      })),
      employees: employeesWithStats.map(employee => ({
        name: employee.name,
        role: employee.role,
        emailCount: Number(employee.emailCount) || 0,
        avgReplyTime: Math.round((Number(employee.avgReplyTime) || 0) * 10) / 10,
        active: employee.active,
        performanceScore: employee.responsivenessScore,
        responsivenessScore: employee.responsivenessScore,
        totalTasks: employee.totalTasks,
        completedTasks: employee.completedTasks,
        pendingTasks: employee.pendingTasks,
        overdueTasks: employee.overdueTasks
      })),
      recentEmails: allEmails.slice(0, 50).map(email => ({ // Increased for maximum analysis
        timestamp: email.timestamp,
        customerName: email.customerName || 'Unknown',
        employeeName: email.employeeName || 'Unknown',
        subject: email.subject,
        sentiment: email.sentiment,
        summary: email.summary,
        actionNeeded: email.actionNeeded,
        replyTimeMinutes: email.replyTimeMinutes
      }))
    };

    // Perform comprehensive analysis with maximum tokens
    const comprehensiveAnalysis = await performComprehensiveAnalysis(comprehensiveData);

    res.json({
      success: true,
      data: {
        metrics: {
          totalEmails,
          happyEmails,
          neutralEmails,
          unhappyEmails,
          flaggedIssues,
          avgReplyTime: Math.round(avgReplyTime * 10) / 10,
          totalCustomers,
          happyCustomers,
          unhappyCustomers,
          totalEmployees,
          activeEmployees
        },
        analysis: comprehensiveAnalysis,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error generating comprehensive analysis:', error);
    res.status(500).json({ 
      error: 'Failed to generate comprehensive analysis',
      details: error.message 
    });
  }
});

// Test endpoint to check database and AI service
router.get('/test', async (req, res) => {
  try {
    console.log('🧪 Testing database and AI service...');
    
    // Test database connection
    const [userCount] = await db
      .select({ count: count() })
      .from(users);
    
    console.log('✅ Database connection working, user count:', userCount.count);
    
    // Test AI service
    const testData = {
      totalEmails: 10,
      happyEmails: 7,
      neutralEmails: 2,
      unhappyEmails: 1,
      flaggedIssues: 1,
      avgReplyTime: 120,
      customers: [
        {
          name: "Test Customer",
          emailCount: 5,
          overallSentiment: "happy",
          flaggedIssues: false,
          lastEmailDate: new Date().toISOString()
        }
      ],
      employees: [
        {
          name: "Test Employee",
          role: "CSM",
          emailCount: 5,
          avgReplyTime: 120,
          active: true,
          performanceScore: 85,
          responsivenessScore: 90,
          totalTasks: 10,
          completedTasks: 8
        }
      ],
      recentEmails: [
        {
          timestamp: new Date().toISOString(),
          customerName: "Test Customer",
          employeeName: "Test Employee",
          subject: "Test Email",
          sentiment: "happy",
          summary: "Test summary",
          actionNeeded: false
        }
      ]
    };
    
    console.log('🤖 Testing AI service...');
    const aiResult = await analyzeQADashboard(testData);
    console.log('✅ AI service working');
    
    res.json({
      success: true,
      message: 'Database and AI service are working correctly',
      data: {
        databaseStatus: 'connected',
        userCount: userCount.count,
        aiStatus: 'working',
        aiResult: aiResult
      }
    });
  } catch (error) {
    console.error('❌ Test failed:', error);
    res.status(500).json({
      success: false,
      error: 'Test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

export default router;
