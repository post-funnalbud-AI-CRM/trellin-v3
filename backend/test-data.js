import dotenv from 'dotenv';
import { db } from './src/db/index.js';
import { emailLogs, emailInsights, customers, employees, users } from './src/db/schema.js';
import { eq, count } from 'drizzle-orm';

dotenv.config();

async function testData() {
  try {
    console.log('🧪 Testing populated data...\n');

    // Test user count
    const [userCount] = await db.select({ count: count() }).from(users);
    console.log(`👤 Users: ${userCount.count}`);

    // Test customer count
    const [customerCount] = await db.select({ count: count() }).from(customers);
    console.log(`🏢 Customers: ${customerCount.count}`);

    // Test employee count
    const [employeeCount] = await db.select({ count: count() }).from(employees);
    console.log(`👥 Employees: ${employeeCount.count}`);

    // Test email count
    const [emailCount] = await db.select({ count: count() }).from(emailLogs);
    console.log(`📧 Emails: ${emailCount.count}`);

    // Test insights count
    const [insightCount] = await db.select({ count: count() }).from(emailInsights);
    console.log(`🤖 AI Insights: ${insightCount.count}`);

    // Get sentiment distribution
    const sentimentStats = await db
      .select({
        sentiment: emailLogs.sentiment,
        count: count()
      })
      .from(emailLogs)
      .groupBy(emailLogs.sentiment);

    console.log('\n📊 Sentiment Distribution:');
    sentimentStats.forEach(stat => {
      console.log(`  ${stat.sentiment}: ${stat.count}`);
    });

    // Get sample emails
    const sampleEmails = await db
      .select({
        id: emailLogs.id,
        subject: emailLogs.subject,
        sentiment: emailLogs.sentiment,
        summary: emailLogs.summary,
        actionNeeded: emailLogs.actionNeeded
      })
      .from(emailLogs)
      .limit(5);

    console.log('\n📧 Sample Emails:');
    sampleEmails.forEach((email, index) => {
      console.log(`  ${index + 1}. ${email.subject} (${email.sentiment})`);
      console.log(`     Summary: ${email.summary?.substring(0, 100)}...`);
      console.log(`     Action Needed: ${email.actionNeeded}`);
    });

    // Get sample insights
    const sampleInsights = await db
      .select({
        emailId: emailInsights.emailId,
        sentiment: emailInsights.sentiment,
        summary: emailInsights.summary,
        waitingFor: emailInsights.waitingFor,
        recommendedAction: emailInsights.recommendedAction,
        isFlagged: emailInsights.isFlagged
      })
      .from(emailInsights)
      .limit(3);

    console.log('\n🤖 Sample AI Insights:');
    sampleInsights.forEach((insight, index) => {
      console.log(`  ${index + 1}. Sentiment: ${insight.sentiment}`);
      console.log(`     Summary: ${insight.summary?.substring(0, 100)}...`);
      console.log(`     Waiting For: ${insight.waitingFor}`);
      console.log(`     Recommended Action: ${insight.recommendedAction}`);
      console.log(`     Flagged: ${insight.isFlagged}`);
    });

    console.log('\n✅ Data verification completed successfully!');
    console.log('🚀 You can now test the API endpoints:');
    console.log('   - GET /api/v1/insights/dashboard');
    console.log('   - GET /api/v1/insights/emails');
    console.log('   - GET /api/v1/insights/customers');
    console.log('   - GET /api/v1/insights/employees');
    console.log('   - GET /api/v1/insights/daily-summary');

  } catch (error) {
    console.error('❌ Data verification failed:', error);
  }
}

testData();
