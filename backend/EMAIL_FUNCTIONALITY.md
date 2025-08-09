# Email Functionality Guide

This guide explains the complete email analysis and insights system for the Trellin customer success platform.

## 🚀 Quick Start

### 1. Seed the Database with Dummy Emails

```bash
# Populate database with 50+ emails and AI analysis
pnpm seed:emails
```

### 2. Verify the Data

```bash
# Check that data was populated correctly
pnpm test:data
```

### 3. Start the Server

```bash
# Start the development server
pnpm dev
```

## 📊 What Gets Created

When you run `pnpm seed:emails`, the system creates:

- **1 Test User**: John Smith (john@trellin.com)
- **5 Customers**: Acme Corp, TechStart Solutions, Global Retail, Innovate Labs, DataFlow Systems
- **3 Employees**: Sarah Johnson, Mike Chen, Lisa Rodriguez
- **70 Emails**: Mix of happy, neutral, and unhappy emails
- **70 AI Insights**: Each email is analyzed by AI for sentiment, summary, and recommendations

## 🤖 AI Analysis Features

### Email Analysis
Each email is automatically analyzed for:
- **Sentiment**: happy/neutral/unhappy
- **Summary**: Brief summary of email content
- **Waiting For**: What the customer is waiting for
- **Recommended Action**: What should be done next
- **Flagged Status**: Whether immediate attention is needed

### Customer Sentiment Analysis
- Analyzes email history to determine overall customer satisfaction
- Identifies key concerns and positive aspects
- Provides risk assessment and recommendations

### Daily Summary Generation
- Generates AI-powered daily reports
- Summarizes customer satisfaction status
- Highlights key issues and recommendations

## 📡 API Endpoints

### Email Insights
- `GET /api/v1/insights/emails` - Get all emails with analysis
- `GET /api/v1/insights/emails/:emailId/insights` - Get specific email insights

### Customer Analysis
- `GET /api/v1/insights/customers` - Get customer list with sentiment
- `GET /api/v1/insights/customers/:customerId/sentiment` - Get detailed customer sentiment analysis

### Dashboard Data
- `GET /api/v1/insights/dashboard` - Get dashboard summary with metrics
- `GET /api/v1/insights/daily-summary` - Get AI-generated daily summary
- `GET /api/v1/insights/employees` - Get employee performance data

### AI Analysis
- `POST /api/v1/ai/analyze-email` - Analyze a single email
- `POST /api/v1/ai/analyze-customer-sentiment` - Analyze customer sentiment
- `POST /api/v1/ai/generate-daily-summary` - Generate daily summary
- `GET /api/v1/ai/health` - Check AI service health

## 📧 Email Types Created

### Happy Emails (10 emails)
- Website launch success stories
- Project milestone achievements
- Thank you messages
- Positive feedback on features

### Neutral Emails (48 emails)
- Feature requests
- Report requests
- Contract discussions
- Technical consultations
- General inquiries

### Unhappy Emails (12 emails)
- Website downtime issues
- Billing problems
- Poor response time complaints
- Feature not working as promised
- Disappointment with changes

## 🎯 Sample Data

### Sample Email Analysis
```json
{
  "sentiment": "happy",
  "summary": "Customer is expressing gratitude for the successful website launch and is pleased with the results",
  "waitingFor": "Nothing specific; the customer is not requesting any action",
  "recommendedAction": "Acknowledge the customer's positive feedback and express enthusiasm for future collaboration",
  "isFlagged": false
}
```

### Sample Customer Data
```json
{
  "id": "uuid",
  "name": "Acme Corp",
  "primaryDomain": "acme.com",
  "overallSentiment": "neutral",
  "emailCount": 15,
  "lastEmailDate": "2024-01-15T10:30:00Z"
}
```

## 🔧 Testing the System

### 1. Test AI Functionality
```bash
pnpm test:ai
```

### 2. Test Data Population
```bash
pnpm test:data
```

### 3. Test API Endpoints
```bash
# Start server
pnpm dev

# Test endpoints (requires authentication)
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/v1/insights/dashboard
```

## 📈 Dashboard Metrics

The system provides comprehensive metrics:

### Email Metrics
- Total emails processed
- Sentiment distribution (happy/neutral/unhappy)
- Flagged emails requiring attention
- Recent email activity

### Customer Metrics
- Total customers
- Customer satisfaction levels
- Customer engagement (email frequency)
- Risk assessment

### Employee Metrics
- Employee performance scores
- Response time averages
- Task completion rates
- Customer satisfaction ratings

## 🔄 Workflow

1. **Email Ingestion**: Emails are stored in the database
2. **AI Analysis**: Each email is analyzed for sentiment and insights
3. **Insight Storage**: AI analysis is stored in email_insights table
4. **Dashboard Display**: Frontend retrieves insights for display
5. **Customer Analysis**: AI analyzes customer email history
6. **Daily Summaries**: AI generates daily reports

## 🛠️ Customization

### Adding New Email Templates
Edit `src/utils/emailSeeder.js` to add new email templates:

```javascript
const newEmailTemplate = {
  subject: 'New email subject',
  body: 'Email body content',
  sentiment: 'happy/neutral/unhappy',
  customerIndex: 0 // Index of customer in dummyCustomers array
};
```

### Modifying AI Analysis
Edit `src/services/aiService.js` to customize AI prompts and analysis logic.

### Adding New Metrics
Edit `src/routes/insights.js` to add new dashboard metrics and endpoints.

## 🚨 Troubleshooting

### Common Issues

1. **"Failed to analyze email"**
   - Check Azure OpenAI API key in .env
   - Verify API endpoint configuration
   - Check network connectivity

2. **"Database connection failed"**
   - Verify DATABASE_URL in .env
   - Run `pnpm db:migrate` to ensure schema is up to date

3. **"No data found"**
   - Run `pnpm seed:emails` to populate data
   - Check that user authentication is working

### Debug Commands
```bash
# Test AI functionality
pnpm test:ai

# Verify data population
pnpm test:data

# Check database schema
pnpm db:studio

# View server logs
pnpm dev
```

## 📋 Next Steps

1. **Frontend Integration**: Connect React frontend to these endpoints
2. **Real Email Sync**: Implement Gmail API integration
3. **Real-time Updates**: Add WebSocket support for live updates
4. **Advanced Analytics**: Add more sophisticated AI analysis
5. **Automated Actions**: Implement automated responses based on AI insights

## 🎉 Success Indicators

✅ **70 emails** created with AI analysis  
✅ **5 customers** with varied satisfaction levels  
✅ **3 employees** with performance metrics  
✅ **Sentiment distribution**: 10 happy, 48 neutral, 12 unhappy  
✅ **AI insights** for every email with actionable recommendations  
✅ **Dashboard endpoints** ready for frontend integration  

Your email analysis system is now ready to provide intelligent insights for your customer success platform! 🚀
