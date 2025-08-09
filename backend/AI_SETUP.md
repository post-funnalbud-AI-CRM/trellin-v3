# AI Functionality Setup Guide

This guide explains how to set up and use the AI functionality in the Trellin backend using Azure OpenAI.

## 🚀 Quick Start

### 1. Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=E3r7Hq6foeCvUiC84or4PdzLGtgpyTcVLjN3ZXagRYYk33vbFObXJQQJ99BHACYeBjFXJ3w3AAABACOG1Xrs
AZURE_OPENAI_ENDPOINT=https://submaiteopenai.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_API_VERSION=2024-04-01-preview

# Other required variables
DATABASE_URL=your-database-url
JWT_SECRET=your-jwt-secret
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Test AI Functionality

```bash
node test-ai.js
```

## 🤖 AI Services

The backend includes the following AI-powered services:

### Email Analysis
- **Endpoint**: `POST /api/v1/ai/analyze-email`
- **Purpose**: Analyzes individual emails for sentiment, summary, and action items
- **Input**: Email subject, body, sender, recipient, timestamp
- **Output**: Sentiment, summary, waiting for, recommended action, flagged status

### Customer Sentiment Analysis
- **Endpoint**: `POST /api/v1/ai/analyze-customer-sentiment`
- **Purpose**: Analyzes a customer's email history for overall satisfaction
- **Input**: Customer ID and array of email data
- **Output**: Overall sentiment, key concerns, positive aspects, risk level, recommendations

### Employee Performance Analysis
- **Endpoint**: `POST /api/v1/ai/analyze-employee-performance`
- **Purpose**: Analyzes employee performance metrics
- **Input**: Employee data (tasks, response times, satisfaction scores)
- **Output**: Performance score, responsiveness rating, strengths, improvement areas

### Daily Summary Generation
- **Endpoint**: `POST /api/v1/ai/generate-daily-summary`
- **Purpose**: Generates daily summary reports
- **Input**: Daily metrics (customers, tasks, issues)
- **Output**: Professional summary with recommendations

### Task Priority Analysis
- **Endpoint**: `POST /api/v1/ai/analyze-task-priority`
- **Purpose**: Determines task priority and urgency
- **Input**: Task description, customer info, due date
- **Output**: Priority level, urgency, impact, recommended assignee

## 📋 API Examples

### Analyze Email
```bash
curl -X POST http://localhost:3001/api/v1/ai/analyze-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "subject": "Website update request",
    "body": "Hi team, I was wondering if you could update our website with the new branding.",
    "fromEmail": "client@example.com",
    "toEmail": "support@company.com",
    "timestamp": "2024-01-15T10:30:00Z"
  }'
```

### Generate Daily Summary
```bash
curl -X POST http://localhost:3001/api/v1/ai/generate-daily-summary \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "totalCustomers": 25,
    "happyCustomers": 18,
    "unhappyCustomers": 3,
    "openTasks": 12,
    "overdueTasks": 2,
    "flaggedIssues": 1
  }'
```

## 🔧 Configuration

### Azure OpenAI Settings
- **Model**: GPT-4o
- **Endpoint**: https://submaiteopenai.openai.azure.com/
- **Deployment**: gpt-4o
- **API Version**: 2024-04-01-preview

### Environment Variables
All configuration is managed through environment variables in `src/utils/config.js`:

- `AZURE_OPENAI_API_KEY`: Your Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT`: Azure OpenAI endpoint URL
- `AZURE_OPENAI_DEPLOYMENT`: Model deployment name
- `AZURE_OPENAI_API_VERSION`: API version

## 🧪 Testing

### Health Check
```bash
curl http://localhost:3001/api/v1/ai/health
```

### Test Script
Run the included test script:
```bash
node test-ai.js
```

## 📁 File Structure

```
backend/
├── src/
│   ├── services/
│   │   └── aiService.js          # AI service functions
│   ├── routes/
│   │   └── ai.js                 # AI API routes
│   └── utils/
│       └── config.js             # Configuration management
├── test-ai.js                    # AI functionality test
└── AI_SETUP.md                   # This file
```

## 🔒 Security

- All AI endpoints require JWT authentication
- API keys are stored in environment variables
- Input validation is performed on all endpoints
- Error handling prevents sensitive information leakage

## 🚨 Troubleshooting

### Common Issues

1. **"AZURE_OPENAI_API_KEY environment variable is required"**
   - Check your `.env` file
   - Ensure the API key is correct

2. **"AI service is not healthy"**
   - Verify your Azure OpenAI configuration
   - Check network connectivity

3. **"Failed to analyze email"**
   - Check the input format
   - Verify the API key has proper permissions

### Debug Mode
Set `NODE_ENV=development` to see detailed error messages.

## 📈 Performance

- Email analysis: ~2-3 seconds
- Customer sentiment: ~3-5 seconds
- Employee performance: ~2-3 seconds
- Daily summary: ~1-2 seconds
- Task priority: ~1-2 seconds

## 🔄 Integration

The AI services are designed to integrate with:
- Email sync functionality
- Customer management system
- Employee performance tracking
- Task management system
- Daily reporting system
