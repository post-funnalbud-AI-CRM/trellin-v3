import express from 'express';
import { db } from '../db/index.js';
import { customerTopics, emailLogs, customers } from '../db/schema.js';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { 
  analyzeCustomerTopics, 
  updateTopicStatus, 
  generateTopicVerdict 
} from '../services/aiService.js';
import { 
  processNewEmailsForTopics, 
  processAllNewEmails, 
  simulateNewEmail 
} from '../services/autoTopicProcessor.js';

const router = express.Router();

// Get all topics for a customer
router.get('/customers/:customerId/topics', async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    const topics = await db
      .select()
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId)
      ))
      .orderBy(desc(customerTopics.lastUpdated));

    res.json({
      success: true,
      data: topics
    });
  } catch (error) {
    console.error('Error fetching customer topics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch customer topics',
      details: error.message 
    });
  }
});

// Generate topics for a customer based on their emails
router.post('/customers/:customerId/analyze-topics', async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    console.log(`🔍 Analyzing topics for customer ${customerId}`);

    // Get customer emails
    const customerEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        body: emailLogs.body,
        timestamp: emailLogs.timestamp,
        sentiment: emailLogs.sentiment,
        fromEmail: emailLogs.fromEmail,
        toEmail: emailLogs.toEmail
      })
      .from(emailLogs)
      .where(and(
        eq(emailLogs.customerId, customerId),
        eq(emailLogs.userId, userId)
      ))
      .orderBy(emailLogs.timestamp);

    if (customerEmails.length === 0) {
      return res.status(404).json({ error: 'No emails found for customer' });
    }

    console.log(`📧 Found ${customerEmails.length} emails for analysis`);

    // Analyze topics with AI
    const aiAnalysis = await analyzeCustomerTopics(customerEmails);
    
    console.log(`🤖 AI identified ${aiAnalysis.topics.length} topics`);

    // Save topics to database
    const savedTopics = [];
    for (const topic of aiAnalysis.topics) {
      const newTopic = await db
        .insert(customerTopics)
        .values({
          customerId,
          userId,
          title: topic.title,
          snapshot: topic.snapshot,
          status: topic.status,
          priority: topic.priority,
          category: topic.category,
          relatedEmails: topic.relatedEmailIds,
          firstMentioned: new Date(topic.firstMentioned),
          aiConfidence: topic.confidence
        })
        .returning();

      savedTopics.push(newTopic[0]);
    }

    console.log(`💾 Saved ${savedTopics.length} topics to database`);

    res.json({
      success: true,
      data: {
        message: `Generated ${savedTopics.length} topics for customer`,
        topics: savedTopics,
        analysis: aiAnalysis
      }
    });
  } catch (error) {
    console.error('Error analyzing customer topics:', error);
    res.status(500).json({ 
      error: 'Failed to analyze customer topics',
      details: error.message 
    });
  }
});

// Update topic status
router.put('/topics/:topicId/status', async (req, res) => {
  try {
    const { topicId } = req.params;
    const { status, snapshot } = req.body;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get current topic
    const [currentTopic] = await db
      .select()
      .from(customerTopics)
      .where(and(
        eq(customerTopics.id, topicId),
        eq(customerTopics.userId, userId)
      ))
      .limit(1);

    if (!currentTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Update topic
    const updateData = {
      status,
      lastUpdated: new Date()
    };

    if (snapshot) {
      updateData.snapshot = snapshot;
    }

    if (status === 'closed') {
      updateData.closedAt = new Date();
    }

    const [updatedTopic] = await db
      .update(customerTopics)
      .set(updateData)
      .where(eq(customerTopics.id, topicId))
      .returning();

    res.json({
      success: true,
      data: updatedTopic
    });
  } catch (error) {
    console.error('Error updating topic status:', error);
    res.status(500).json({ 
      error: 'Failed to update topic status',
      details: error.message 
    });
  }
});

// Generate final verdict for closed topic
router.post('/topics/:topicId/generate-verdict', async (req, res) => {
  try {
    const { topicId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get topic
    const [topic] = await db
      .select()
      .from(customerTopics)
      .where(and(
        eq(customerTopics.id, topicId),
        eq(customerTopics.userId, userId)
      ))
      .limit(1);

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    if (topic.status !== 'closed') {
      return res.status(400).json({ error: 'Topic must be closed to generate verdict' });
    }

    // Get related emails
    const relatedEmailIds = Array.isArray(topic.relatedEmails) ? topic.relatedEmails : [];
    let relatedEmails = [];
    
    if (relatedEmailIds.length > 0) {
      relatedEmails = await db
        .select({
          id: emailLogs.id,
          subject: emailLogs.subject,
          body: emailLogs.body,
          timestamp: emailLogs.timestamp,
          sentiment: emailLogs.sentiment
        })
        .from(emailLogs)
        .where(sql`${emailLogs.id} IN (${sql.join(relatedEmailIds.map(id => sql`${id}`), sql`, `)})`);
    }

    // Generate verdict with AI
    const verdict = await generateTopicVerdict(topic, relatedEmails);

    // Update topic with verdict
    const [updatedTopic] = await db
      .update(customerTopics)
      .set({ finalVerdict: verdict })
      .where(eq(customerTopics.id, topicId))
      .returning();

    res.json({
      success: true,
      data: {
        topic: updatedTopic,
        verdict
      }
    });
  } catch (error) {
    console.error('Error generating topic verdict:', error);
    res.status(500).json({ 
      error: 'Failed to generate topic verdict',
      details: error.message 
    });
  }
});

// Auto-update topics based on new emails (this would be called when new emails are processed)
router.post('/customers/:customerId/update-topics', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { newEmailIds } = req.body; // Array of new email IDs
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    if (!newEmailIds || newEmailIds.length === 0) {
      return res.status(400).json({ error: 'No new email IDs provided' });
    }

    // Get existing topics for customer
    const existingTopics = await db
      .select()
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId),
        sql`${customerTopics.status} != 'closed'` // Only update non-closed topics
      ));

    // Get new emails
    const newEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        body: emailLogs.body,
        timestamp: emailLogs.timestamp,
        sentiment: emailLogs.sentiment
      })
      .from(emailLogs)
      .where(sql`${emailLogs.id} IN (${sql.join(newEmailIds.map(id => sql`${id}`), sql`, `)})`);

    const updatedTopics = [];

    // Update each existing topic based on new emails
    for (const topic of existingTopics) {
      try {
        const updateAnalysis = await updateTopicStatus(topic, newEmails);
        
        const updateData = {
          status: updateAnalysis.status,
          snapshot: updateAnalysis.updatedSnapshot || topic.snapshot,
          lastUpdated: new Date()
        };

        if (updateAnalysis.shouldClose && updateAnalysis.status === 'closed') {
          updateData.closedAt = new Date();
          updateData.finalVerdict = updateAnalysis.finalVerdict;
        }

        // Update related emails array to include new relevant emails
        const updatedRelatedEmails = [...(topic.relatedEmails || []), ...newEmailIds];
        updateData.relatedEmails = [...new Set(updatedRelatedEmails)]; // Remove duplicates

        const [updatedTopic] = await db
          .update(customerTopics)
          .set(updateData)
          .where(eq(customerTopics.id, topic.id))
          .returning();

        updatedTopics.push(updatedTopic);
      } catch (error) {
        console.error(`Error updating topic ${topic.id}:`, error);
        // Continue with other topics if one fails
      }
    }

    res.json({
      success: true,
      data: {
        message: `Updated ${updatedTopics.length} topics`,
        updatedTopics
      }
    });
  } catch (error) {
    console.error('Error updating topics:', error);
    res.status(500).json({ 
      error: 'Failed to update topics',
      details: error.message 
    });
  }
});

// Get topic statistics for a customer
router.get('/customers/:customerId/topic-stats', async (req, res) => {
  try {
    const { customerId } = req.params;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get topic statistics
    const [totalTopics] = await db
      .select({ count: count() })
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId)
      ));

    const statusStats = await db
      .select({
        status: customerTopics.status,
        count: count()
      })
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId)
      ))
      .groupBy(customerTopics.status);

    const categoryStats = await db
      .select({
        category: customerTopics.category,
        count: count()
      })
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId)
      ))
      .groupBy(customerTopics.category);

    const priorityStats = await db
      .select({
        priority: customerTopics.priority,
        count: count()
      })
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId)
      ))
      .groupBy(customerTopics.priority);

    res.json({
      success: true,
      data: {
        totalTopics: totalTopics.count,
        statusDistribution: statusStats,
        categoryDistribution: categoryStats,
        priorityDistribution: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching topic stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch topic statistics',
      details: error.message 
    });
  }
});

// Get all topics across all customers (for dashboard overview)
router.get('/topics/overview', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    const topics = await db
      .select({
        id: customerTopics.id,
        title: customerTopics.title,
        snapshot: customerTopics.snapshot,
        status: customerTopics.status,
        priority: customerTopics.priority,
        category: customerTopics.category,
        lastUpdated: customerTopics.lastUpdated,
        customerName: customers.name
      })
      .from(customerTopics)
      .leftJoin(customers, eq(customerTopics.customerId, customers.id))
      .where(eq(customerTopics.userId, userId))
      .orderBy(desc(customerTopics.lastUpdated))
      .limit(50); // Limit for performance

    const [totalCount] = await db
      .select({ count: count() })
      .from(customerTopics)
      .where(eq(customerTopics.userId, userId));

    res.json({
      success: true,
      data: {
        topics,
        totalCount: totalCount.count
      }
    });
  } catch (error) {
    console.error('Error fetching topics overview:', error);
    res.status(500).json({ 
      error: 'Failed to fetch topics overview',
      details: error.message 
    });
  }
});

// ========================
// AUTOMATIC PROCESSING ENDPOINTS
// ========================

// Auto-process new emails for topic updates (this would be called when new emails arrive)
router.post('/customers/:customerId/auto-process-emails', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { emailIds, timeframeHours = 24 } = req.body;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    console.log(`🤖 Auto-processing emails for customer ${customerId}`);

    let result;
    
    if (emailIds && emailIds.length > 0) {
      // Process specific email IDs
      result = await processNewEmailsForTopics(userId, customerId, emailIds);
    } else {
      // Process recent emails from timeframe
      const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
      
      const recentEmailIds = await db
        .select({ id: emailLogs.id })
        .from(emailLogs)
        .where(and(
          eq(emailLogs.customerId, customerId),
          eq(emailLogs.userId, userId),
          sql`${emailLogs.createdAt} >= ${cutoffTime}`
        ));

      if (recentEmailIds.length === 0) {
        return res.json({
          success: true,
          data: { message: 'No recent emails to process', updatedTopics: [] }
        });
      }

      result = await processNewEmailsForTopics(userId, customerId, recentEmailIds.map(e => e.id));
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in auto-processing emails:', error);
    res.status(500).json({ 
      error: 'Failed to auto-process emails',
      details: error.message 
    });
  }
});

// Auto-process all customers' recent emails (batch processing)
router.post('/auto-process-all', async (req, res) => {
  try {
    const { timeframeHours = 24 } = req.body;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    console.log(`🌐 Batch auto-processing all emails from last ${timeframeHours} hours`);

    const result = await processAllNewEmails(userId, timeframeHours);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error in batch auto-processing:', error);
    res.status(500).json({ 
      error: 'Failed to auto-process all emails',
      details: error.message 
    });
  }
});

// Simulate new email to test automatic topic updates
router.post('/customers/:customerId/simulate-email', async (req, res) => {
  try {
    const { customerId } = req.params;
    const { subject, body, sentiment = 'neutral', fromEmail = 'test@customer.com' } = req.body;
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    if (!subject || !body) {
      return res.status(400).json({ error: 'Subject and body are required' });
    }

    console.log(`🧪 Simulating email for customer ${customerId}: "${subject}"`);

    const result = await simulateNewEmail(userId, customerId, {
      subject,
      body,
      sentiment,
      fromEmail,
      toEmail: 'support@company.com',
      summary: `Simulated email: ${subject}`
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error simulating email:', error);
    res.status(500).json({ 
      error: 'Failed to simulate email',
      details: error.message 
    });
  }
});

// Get auto-processing statistics
router.get('/auto-process-stats', async (req, res) => {
  try {
    const userId = req.user?.id || '69c33993-c9b7-420c-9489-1afe25b71c38';

    // Get recently updated topics (last 7 days)
    const recentlyUpdated = await db
      .select({
        id: customerTopics.id,
        title: customerTopics.title,
        status: customerTopics.status,
        lastUpdated: customerTopics.lastUpdated,
        customerName: customers.name
      })
      .from(customerTopics)
      .leftJoin(customers, eq(customerTopics.customerId, customers.id))
      .where(and(
        eq(customerTopics.userId, userId),
        sql`${customerTopics.lastUpdated} >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`
      ))
      .orderBy(desc(customerTopics.lastUpdated))
      .limit(20);

    // Get status change statistics
    const statusStats = await db
      .select({
        status: customerTopics.status,
        count: count()
      })
      .from(customerTopics)
      .where(eq(customerTopics.userId, userId))
      .groupBy(customerTopics.status);

    // Get topics closed in last 7 days
    const recentlyClosed = await db
      .select({ count: count() })
      .from(customerTopics)
      .where(and(
        eq(customerTopics.userId, userId),
        eq(customerTopics.status, 'closed'),
        sql`${customerTopics.closedAt} >= ${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}`
      ));

    res.json({
      success: true,
      data: {
        recentlyUpdatedTopics: recentlyUpdated,
        statusDistribution: statusStats,
        recentlyClosedCount: recentlyClosed[0]?.count || 0,
        lastWeekActivity: recentlyUpdated.length
      }
    });
  } catch (error) {
    console.error('Error fetching auto-process stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch auto-process statistics',
      details: error.message 
    });
  }
});

export default router;
