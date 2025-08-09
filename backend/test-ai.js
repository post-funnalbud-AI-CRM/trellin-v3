import dotenv from 'dotenv';
import { analyzeEmail } from './src/services/aiService.js';

dotenv.config();

async function testAI() {
  try {
    console.log('🧪 Testing AI functionality...');
    
    const testEmailData = {
      subject: 'Website update request',
      body: 'Hi team, I was wondering if you could update our website with the new branding. We have the new logo and colors ready. This is not urgent but would be great to have done by the end of the month. Thanks!',
      fromEmail: 'client@example.com',
      toEmail: 'support@company.com',
      timestamp: new Date().toISOString()
    };

    console.log('📧 Analyzing test email...');
    const analysis = await analyzeEmail(testEmailData);
    
    console.log('✅ AI Analysis Result:');
    console.log(JSON.stringify(analysis, null, 2));
    
    console.log('🎉 AI functionality test completed successfully!');
  } catch (error) {
    console.error('❌ AI test failed:', error.message);
    console.error('Make sure your AZURE_OPENAI_API_KEY is set correctly in your .env file');
  }
}

testAI();
