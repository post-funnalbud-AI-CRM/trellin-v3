import dotenv from 'dotenv';
import { seedEmails } from './src/utils/emailSeeder.js';

dotenv.config();

async function main() {
  try {
    console.log('🚀 Starting email seeding process...');
    console.log('📧 This will create 50+ emails with AI analysis');
    console.log('⏳ This may take a few minutes...\n');

    const result = await seedEmails();

    console.log('\n📊 Seeding Summary:');
    console.log(`👤 User: ${result.user.name} (${result.user.email})`);
    console.log(`🏢 Customers: ${result.customers.length}`);
    console.log(`👥 Employees: ${result.employees.length}`);
    console.log(`📧 Emails: ${result.emails.length}`);
    console.log(`🤖 AI Insights: ${result.insights.length}`);

    console.log('\n🎉 Email seeding completed successfully!');
    console.log('💡 You can now test the AI functionality with real data.');
    console.log('🔗 Start your server with: pnpm dev');
    console.log('🌐 Test the API endpoints to see the populated data.');

  } catch (error) {
    console.error('❌ Email seeding failed:', error);
    process.exit(1);
  }
}

main();
