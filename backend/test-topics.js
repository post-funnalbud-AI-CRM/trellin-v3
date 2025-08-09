import dotenv from 'dotenv';
import { db } from './src/db/index.js';
import { customers, emailLogs, customerTopics } from './src/db/schema.js';
import { eq, count, sql } from 'drizzle-orm';
import { analyzeCustomerTopics } from './src/services/aiService.js';

dotenv.config();

async function testTopics() {
  try {
    console.log('🧪 Testing Customer Topics functionality...\n');

    // Get a customer that has emails
    const customersWithEmails = await db
      .select({
        id: customers.id,
        name: customers.name,
        userId: customers.userId,
        emailCount: count(emailLogs.id)
      })
      .from(customers)
      .leftJoin(emailLogs, eq(customers.id, emailLogs.customerId))
      .groupBy(customers.id, customers.name, customers.userId)
      .having(sql`COUNT(${emailLogs.id}) > 0`)
      .limit(1);

    if (customersWithEmails.length === 0) {
      console.log('❌ No customers with emails found. Please run seed-emails.js first.');
      return;
    }

    const customer = customersWithEmails[0];

    console.log(`👤 Testing with customer: ${customer.name}`);

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
      .where(eq(emailLogs.customerId, customer.id))
      .orderBy(emailLogs.timestamp);

    console.log(`📧 Found ${customerEmails.length} emails for analysis`);

    if (customerEmails.length === 0) {
      console.log('❌ No emails found for this customer.');
      return;
    }

    // Test AI topic analysis
    console.log('\n🤖 Testing AI topic analysis...');
    const aiAnalysis = await analyzeCustomerTopics(customerEmails);
    
    console.log(`✅ AI identified ${aiAnalysis.topics.length} topics:`);
    aiAnalysis.topics.forEach((topic, index) => {
      console.log(`  ${index + 1}. ${topic.title}`);
      console.log(`     Status: ${topic.status} | Priority: ${topic.priority}`);
      console.log(`     Snapshot: ${topic.snapshot}`);
      console.log(`     Related emails: ${topic.relatedEmailIds.length}`);
      console.log('');
    });

    // Save topics to database
    console.log('💾 Saving topics to database...');
    const savedTopics = [];
    for (const topic of aiAnalysis.topics) {
      const newTopic = await db
        .insert(customerTopics)
        .values({
          customerId: customer.id,
          userId: customer.userId,
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

    console.log(`✅ Saved ${savedTopics.length} topics to database`);

    // Test topic statistics
    console.log('\n📊 Testing topic statistics...');
    const [totalTopics] = await db
      .select({ count: count() })
      .from(customerTopics)
      .where(eq(customerTopics.customerId, customer.id));

    const statusStats = await db
      .select({
        status: customerTopics.status,
        count: count()
      })
      .from(customerTopics)
      .where(eq(customerTopics.customerId, customer.id))
      .groupBy(customerTopics.status);

    console.log(`Total topics: ${totalTopics.count}`);
    console.log('Status distribution:');
    statusStats.forEach(stat => {
      console.log(`  ${stat.status}: ${stat.count}`);
    });

    console.log('\n🎉 Customer Topics functionality test completed successfully!');
    console.log('💡 You can now test the frontend by visiting the "Customer Topics" dashboard.');
    console.log('🌐 Start your frontend with: pnpm dev (in frontend directory)');

  } catch (error) {
    console.error('❌ Topics test failed:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack
    });
  }
}

testTopics();
