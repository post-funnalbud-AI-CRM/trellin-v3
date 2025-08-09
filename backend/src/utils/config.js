import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'AZURE_OPENAI_API_KEY',
  'DATABASE_URL',
  'JWT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars);
  console.error('Please check your .env file and ensure all required variables are set.');
  process.exit(1);
}

// Configuration object
const config = {
  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  databaseUrl: process.env.DATABASE_URL,
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://4.240.103.28:5173',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Azure OpenAI
  azureOpenAI: {
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'https://submaiteopenai.openai.azure.com/',
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4o',
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-04-01-preview',
    modelName: process.env.AZURE_OPENAI_MODEL || 'gpt-4o',
    maxTokens: process.env.AZURE_OPENAI_MAX_TOKENS || 16000, // Maximum tokens for comprehensive analysis
    temperature: process.env.AZURE_OPENAI_TEMPERATURE || 0.3 // Lower temperature for consistent analysis
  },
  
  // Google OAuth (for future use)
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://4.240.103.28:3001/api/v1/auth/google/callback'
  },
  
  // Email (for future use)
  email: {
    smtpHost: process.env.SMTP_HOST,
    smtpPort: process.env.SMTP_PORT || 587,
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS
  }
};

// Validate Azure OpenAI configuration
if (!config.azureOpenAI.apiKey) {
  console.error('❌ AZURE_OPENAI_API_KEY is required for AI functionality');
  process.exit(1);
}

console.log('✅ Environment configuration validated successfully');

export default config;
