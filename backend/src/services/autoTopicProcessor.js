import { db } from '../db/index.js';
import { customerTopics, emailLogs, customers } from '../db/schema.js';
import { eq, and, sql, desc } from 'drizzle-orm';
import { updateTopicStatus, generateTopicVerdict } from './aiService.js';

/**
 * Automatic Topic Processor Service
 * 
 * This service automatically:
 * 1. Monitors new emails for existing topics
 * 2. Updates topic status based on email content
 * 3. Updates snapshots when new information is available
 * 4. Generates verdicts when topics are closed
 * 5. Creates new topics if new issues are discovered
 */

// Process new emails and update related topics automatically
export const processNewEmailsForTopics = async (userId, customerId, newEmailIds) => {
  try {
    console.log(`🤖 Auto-processing ${newEmailIds.length} new emails for customer ${customerId}`);

    // Get all active topics for this customer
    const activeTopics = await db
      .select()
      .from(customerTopics)
      .where(and(
        eq(customerTopics.customerId, customerId),
        eq(customerTopics.userId, userId),
        sql`${customerTopics.status} != 'closed'` // Only process non-closed topics
      ));

    if (activeTopics.length === 0) {
      console.log('📝 No active topics found for this customer');
      return { updatedTopics: [], message: 'No active topics to update' };
    }

    // Get the new emails
    const newEmails = await db
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
      .where(sql`${emailLogs.id} IN (${sql.join(newEmailIds.map(id => sql`${id}`), sql`, `)})`)
      .orderBy(desc(emailLogs.timestamp));

    console.log(`📧 Processing ${newEmails.length} new emails against ${activeTopics.length} active topics`);

    const updatedTopics = [];

    // Process each active topic against new emails
    for (const topic of activeTopics) {
      try {
        console.log(`🔍 Analyzing topic: "${topic.title}" (${topic.status})`);

        // Use AI to determine if this topic should be updated based on new emails
        const updateAnalysis = await updateTopicStatus(topic, newEmails);
        
        console.log(`🧠 AI Analysis for "${topic.title}":`, {
          currentStatus: topic.status,
          newStatus: updateAnalysis.status,
          statusReason: updateAnalysis.statusReason,
          snapshotChanged: updateAnalysis.snapshotChanged,
          confidence: updateAnalysis.confidence,
          keywords: updateAnalysis.detectedKeywords
        });

        // Only update if AI has reasonable confidence or status actually changed
        if (updateAnalysis.confidence > 0.6 || updateAnalysis.status !== topic.status) {
          
          const updateData = {
            lastUpdated: new Date()
          };

          // Update status if it changed
          if (updateAnalysis.status !== topic.status) {
            updateData.status = updateAnalysis.status;
            console.log(`✅ Status changed: ${topic.status} → ${updateAnalysis.status} (${updateAnalysis.statusReason})`);
          }

          // Update snapshot if AI detected significant changes
          if (updateAnalysis.snapshotChanged && updateAnalysis.updatedSnapshot) {
            updateData.snapshot = updateAnalysis.updatedSnapshot;
            console.log(`📝 Snapshot updated: ${updateAnalysis.updatedSnapshot}`);
          }

          // If closing the topic, set closed date and generate verdict
          if (updateAnalysis.status === 'closed') {
            updateData.closedAt = new Date();
            
            // Generate comprehensive verdict if AI suggests closing
            if (updateAnalysis.finalVerdict) {
              updateData.finalVerdict = updateAnalysis.finalVerdict;
              console.log(`🎯 Final verdict generated: ${updateAnalysis.finalVerdict.substring(0, 100)}...`);
            }
          }

          // Update related emails array to include new relevant emails
          const currentRelatedEmails = Array.isArray(topic.relatedEmails) ? topic.relatedEmails : [];
          const updatedRelatedEmails = [...currentRelatedEmails, ...newEmailIds];
          updateData.relatedEmails = [...new Set(updatedRelatedEmails)]; // Remove duplicates

          // Apply the update to database
          const [updatedTopic] = await db
            .update(customerTopics)
            .set(updateData)
            .where(eq(customerTopics.id, topic.id))
            .returning();

          updatedTopics.push({
            ...updatedTopic,
            updateReason: updateAnalysis.statusReason,
            detectedKeywords: updateAnalysis.detectedKeywords,
            confidence: updateAnalysis.confidence
          });

          console.log(`💾 Topic "${topic.title}" updated successfully`);
        } else {
          console.log(`⏭️  No significant changes detected for "${topic.title}" (confidence: ${updateAnalysis.confidence})`);
        }

      } catch (error) {
        console.error(`❌ Error processing topic "${topic.title}":`, error.message);
        // Continue with other topics if one fails
      }
    }

    console.log(`🎉 Auto-processing completed. Updated ${updatedTopics.length} topics.`);

    return {
      updatedTopics,
      message: `Successfully processed ${newEmails.length} emails and updated ${updatedTopics.length} topics`,
      totalTopicsAnalyzed: activeTopics.length,
      newEmailsProcessed: newEmails.length
    };

  } catch (error) {
    console.error('❌ Error in automatic topic processing:', error);
    throw new Error(`Failed to process emails for topic updates: ${error.message}`);
  }
};

// Auto-process all customers' new emails (could be called by cron job)
export const processAllNewEmails = async (userId, timeframeHours = 24) => {
  try {
    console.log(`🌐 Auto-processing all new emails for user ${userId} from last ${timeframeHours} hours`);

    // Get all emails from the last timeframe
    const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);
    
    const recentEmails = await db
      .select({
        id: emailLogs.id,
        customerId: emailLogs.customerId,
        customerName: customers.name
      })
      .from(emailLogs)
      .leftJoin(customers, eq(emailLogs.customerId, customers.id))
      .where(and(
        eq(emailLogs.userId, userId),
        sql`${emailLogs.createdAt} >= ${cutoffTime}`
      ))
      .orderBy(desc(emailLogs.createdAt));

    if (recentEmails.length === 0) {
      return { message: 'No recent emails to process' };
    }

    // Group emails by customer
    const emailsByCustomer = recentEmails.reduce((acc, email) => {
      if (!acc[email.customerId]) {
        acc[email.customerId] = {
          customerName: email.customerName,
          emailIds: []
        };
      }
      acc[email.customerId].emailIds.push(email.id);
      return acc;
    }, {});

    const results = [];

    // Process each customer's new emails
    for (const [customerId, data] of Object.entries(emailsByCustomer)) {
      try {
        console.log(`👤 Processing ${data.emailIds.length} emails for customer: ${data.customerName}`);
        
        const result = await processNewEmailsForTopics(userId, customerId, data.emailIds);
        results.push({
          customerId,
          customerName: data.customerName,
          ...result
        });

      } catch (error) {
        console.error(`❌ Error processing customer ${data.customerName}:`, error.message);
        results.push({
          customerId,
          customerName: data.customerName,
          error: error.message
        });
      }
    }

    const totalUpdated = results.reduce((sum, r) => sum + (r.updatedTopics?.length || 0), 0);
    
    console.log(`🎊 Batch processing completed! Updated ${totalUpdated} topics across ${results.length} customers.`);

    return {
      message: `Processed ${recentEmails.length} recent emails and updated ${totalUpdated} topics`,
      customersProcessed: results.length,
      totalEmailsProcessed: recentEmails.length,
      totalTopicsUpdated: totalUpdated,
      results
    };

  } catch (error) {
    console.error('❌ Error in batch email processing:', error);
    throw new Error(`Failed to process batch emails: ${error.message}`);
  }
};

// Simulate new email for testing automatic updates
export const simulateNewEmail = async (userId, customerId, emailData) => {
  try {
    console.log(`🧪 Simulating new email for customer ${customerId}`);

    // Insert the simulated email
    const [newEmail] = await db
      .insert(emailLogs)
      .values({
        userId,
        customerId,
        fromEmail: emailData.fromEmail || 'test@customer.com',
        toEmail: emailData.toEmail || 'support@company.com',
        subject: emailData.subject,
        body: emailData.body,
        timestamp: new Date(),
        sentiment: emailData.sentiment || 'neutral',
        summary: emailData.summary || 'Simulated email for testing',
        actionNeeded: emailData.actionNeeded || false,
        replied: false
      })
      .returning();

    console.log(`📧 Simulated email created with ID: ${newEmail.id}`);

    // Process this new email for topic updates
    const result = await processNewEmailsForTopics(userId, customerId, [newEmail.id]);

    return {
      simulatedEmail: newEmail,
      ...result
    };

  } catch (error) {
    console.error('❌ Error simulating email:', error);
    throw new Error(`Failed to simulate email: ${error.message}`);
  }
};

export default {
  processNewEmailsForTopics,
  processAllNewEmails,
  simulateNewEmail
};
