import { AzureOpenAI } from "openai";
import config from "../utils/config.js";

// Initialize Azure OpenAI client
const createAIClient = () => {
  const { azureOpenAI } = config;
  
  console.log('🔧 Initializing Azure OpenAI client with config:', {
    endpoint: azureOpenAI.endpoint,
    deployment: azureOpenAI.deployment,
    apiVersion: azureOpenAI.apiVersion,
    modelName: azureOpenAI.modelName
  });
  
  const options = { 
    endpoint: azureOpenAI.endpoint, 
    apiKey: azureOpenAI.apiKey, 
    deployment: azureOpenAI.deployment, 
    apiVersion: azureOpenAI.apiVersion 
  };

  return new AzureOpenAI(options);
};

// Helper function to extract JSON from AI response
const extractJSONFromResponse = (content) => {
  try {
    // First try to parse as-is
    return JSON.parse(content);
  } catch (error) {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.error("Failed to parse JSON from markdown:", parseError);
      }
    }
    
    // If still no luck, try to find JSON object in the text
    const jsonObjectMatch = content.match(/\{[\s\S]*\}/);
    if (jsonObjectMatch) {
      try {
        return JSON.parse(jsonObjectMatch[0]);
      } catch (parseError) {
        console.error("Failed to parse JSON object:", parseError);
      }
    }
    
    throw new Error("Could not extract valid JSON from AI response");
  }
};

// Email Analysis Service
export const analyzeEmail = async (emailData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are an AI assistant specialized in analyzing customer service emails for a customer success platform. 
  
  Analyze the email and provide a JSON response with the following structure:
  {
    "sentiment": "happy/neutral/unhappy",
    "summary": "Brief summary of the email content",
    "waitingFor": "What the customer is waiting for (if any)",
    "recommendedAction": "What should be done next",
    "isFlagged": true/false
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Email Subject: ${emailData.subject}
  Email Body: ${emailData.body}
  From: ${emailData.fromEmail}
  To: ${emailData.toEmail}
  Date: ${emailData.timestamp}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("AI Analysis Error:", error);
    throw new Error("Failed to analyze email");
  }
};

// Customer Sentiment Analysis
export const analyzeCustomerSentiment = async (customerEmails) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing a customer's email history to determine their overall satisfaction level.
  
  Provide a JSON response with the following structure:
  {
    "overallSentiment": "happy/neutral/unhappy",
    "keyConcerns": ["List of main issues or complaints"],
    "positiveAspects": ["What they're happy about"],
    "riskLevel": "low/medium/high",
    "recommendations": ["What actions should be taken"]
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Customer Email History:
  ${customerEmails.map(email => `
  Date: ${email.timestamp}
  Subject: ${email.subject}
  Sentiment: ${email.sentiment}
  Summary: ${email.summary}
  `).join('\n')}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Customer Sentiment Analysis Error:", error);
    throw new Error("Failed to analyze customer sentiment");
  }
};

// Employee Performance Analysis
export const analyzeEmployeePerformance = async (employeeData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing employee performance data for a customer success team.
  
  Provide a JSON response with the following structure:
  {
    "performanceScore": 0-100,
    "responsiveness": "excellent/good/average/poor",
    "keyStrengths": ["List of positive performance indicators"],
    "areasForImprovement": ["What needs to be worked on"],
    "recommendations": ["Specific actions to improve performance"]
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Employee Performance Data:
  Name: ${employeeData.name}
  Total Tasks: ${employeeData.totalTasks}
  Completed Tasks: ${employeeData.completedTasks}
  Response Time Average: ${employeeData.avgResponseTime} minutes
  Customer Satisfaction: ${employeeData.customerSatisfaction}
  Active Status: ${employeeData.isActive}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 3000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Employee Performance Analysis Error:", error);
    throw new Error("Failed to analyze employee performance");
  }
};

// Daily Summary Generation
export const generateDailySummary = async (summaryData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are generating a comprehensive daily summary report for a customer success platform.
  
  Create a detailed summary that includes:
  1. Overall customer satisfaction status with specific metrics
  2. Key issues that need immediate attention with priority levels
  3. Employee performance highlights and concerns
  4. Specific recommendations for the day with actionable steps
  5. Risk assessment and mitigation strategies
  6. Trends and patterns observed
  7. Success stories and positive developments
  
  Keep it professional, comprehensive, and actionable. Use specific data points and provide clear insights.`;

  const userPrompt = `
  Daily Summary Data:
  Total Customers: ${summaryData.totalCustomers}
  Happy Customers: ${summaryData.happyCustomers}
  Unhappy Customers: ${summaryData.unhappyCustomers}
  Open Tasks: ${summaryData.openTasks}
  Overdue Tasks: ${summaryData.overdueTasks}
  Flagged Issues: ${summaryData.flaggedIssues}
  
  Please provide a comprehensive analysis that covers all aspects of the business operations.
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 8000,
      temperature: 0.4,
      model: config.azureOpenAI.modelName
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Daily Summary Generation Error:", error);
    throw new Error("Failed to generate daily summary");
  }
};

// Task Priority Analysis
export const analyzeTaskPriority = async (taskData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing task priority for a customer success team.
  
  Provide a JSON response with the following structure:
  {
    "priorityLevel": "high/medium/low",
    "urgency": "immediate/soon/later",
    "impact": "high/medium/low",
    "recommendedAssignee": "based on skills and availability",
    "estimatedCompletionTime": "in hours"
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Task Information:
  Description: ${taskData.description}
  Customer: ${taskData.customerName}
  Customer Sentiment: ${taskData.customerSentiment}
  Due Date: ${taskData.dueDate}
  Type: ${taskData.type}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Task Priority Analysis Error:", error);
    throw new Error("Failed to analyze task priority");
  }
};

// Comprehensive Q&A Dashboard Analysis - ENHANCED
export const analyzeQADashboard = async (allEmailsData) => {
  try {
    console.log('🚀 Starting Q&A Dashboard Analysis with data:', {
      totalEmails: allEmailsData.totalEmails,
      customers: allEmailsData.customers.length,
      employees: allEmailsData.employees.length
    });

    const client = createAIClient();
    
    const systemPrompt = `You are an expert AI analyst for a customer success platform. You are performing a comprehensive daily analysis of all business operations.

  Your task is to provide detailed, actionable insights based on extensive data analysis. Since this analysis is performed once per day, you should be thorough and comprehensive.

  For each question, provide exactly ONE detailed paragraph (6-8 sentences) that:
  1. Directly answers the question with specific insights and data points
  2. Uses actual metrics and examples from the provided data
  3. Provides actionable recommendations with clear next steps
  4. Identifies trends, patterns, and anomalies
  5. Assesses risk levels and urgency
  6. Maintains a professional, executive-level tone
  7. Includes specific numbers, percentages, and timeframes where relevant

  Provide a JSON response with the following structure:
  {
    "customerStatusAnswer": "Comprehensive analysis of overall customer satisfaction status with specific metrics, trends, and actionable insights",
    "communicationQualityAnswer": "Detailed assessment of communication effectiveness with specific examples and improvement recommendations",  
    "teamPerformanceAnswer": "Comprehensive team performance analysis with individual and collective metrics, strengths, and areas for improvement",
    "businessRisksAnswer": "Detailed risk assessment with specific threats, impact analysis, and mitigation strategies",
    "actionableInsightsAnswer": "Comprehensive actionable insights with prioritized recommendations and implementation timelines",
    "trendAnalysisAnswer": "Detailed trend analysis with historical patterns, predictive insights, and strategic recommendations",
    "customerHappinessAnswer": "Comprehensive customer happiness analysis with satisfaction metrics, specific feedback themes, and improvement strategies",
    "teamFollowUpAnswer": "Detailed assessment of team follow-up effectiveness with specific pending items, completion rates, and improvement recommendations",
    "problemHandlingAnswer": "Comprehensive problem identification and handling assessment with urgency levels, impact analysis, and resolution strategies",
    "relaxationStatusAnswer": "Detailed action vs relaxation recommendation with specific criteria, risk assessment, and decision framework"
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

    const userPrompt = `
  COMPREHENSIVE BUSINESS DATA FOR DAILY ANALYSIS:

  EMAIL ANALYTICS:
  Total Emails: ${allEmailsData.totalEmails}
  Happy Emails: ${allEmailsData.happyEmails} (${Math.round(allEmailsData.happyEmails/allEmailsData.totalEmails*100)}%)
  Neutral Emails: ${allEmailsData.neutralEmails} (${Math.round(allEmailsData.neutralEmails/allEmailsData.totalEmails*100)}%)
  Unhappy Emails: ${allEmailsData.unhappyEmails} (${Math.round(allEmailsData.unhappyEmails/allEmailsData.totalEmails*100)}%)
  Flagged Issues: ${allEmailsData.flaggedIssues}
  Average Reply Time: ${allEmailsData.avgReplyTime} minutes
  
  CUSTOMER BREAKDOWN (${allEmailsData.customers.length} customers):
  ${allEmailsData.customers.map(customer => `
  Customer: ${customer.name}
  - Total Emails: ${customer.emailCount}
  - Sentiment: ${customer.overallSentiment}
  - Flagged Issues: ${customer.flaggedIssues}
  - Last Contact: ${customer.lastEmailDate}
  - Days Since Last Contact: ${Math.floor((new Date().getTime() - new Date(customer.lastEmailDate).getTime()) / (1000 * 60 * 60 * 24))}
  `).join('\n')}
  
  EMPLOYEE PERFORMANCE (${allEmailsData.employees.length} employees):
  ${allEmailsData.employees.map(employee => `
  Employee: ${employee.name}
  - Emails Handled: ${employee.emailCount}
  - Avg Response Time: ${employee.avgReplyTime} minutes
  - Active Status: ${employee.active}
  - Performance Score: ${employee.performanceScore || 'N/A'}%
  - Responsiveness Score: ${employee.responsivenessScore || 'N/A'}%
  `).join('\n')}
  
  RECENT EMAIL SAMPLES (Last 20 interactions):
  ${allEmailsData.recentEmails.slice(0, 20).map(email => `
  Date: ${email.timestamp}
  Customer: ${email.customerName}
  Subject: ${email.subject}
  Sentiment: ${email.sentiment}
  Summary: ${email.summary}
  Action Needed: ${email.actionNeeded}
  `).join('\n')}

  ADDITIONAL CONTEXT:
  - This is a daily analysis for executive decision-making
  - Focus on actionable insights and strategic recommendations
  - Consider both immediate actions and long-term trends
  - Assess risk levels and business impact
  - Provide specific, measurable recommendations
  `;

    console.log('📤 Sending request to Azure OpenAI...');

    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 16000, // Maximum tokens for comprehensive analysis
      temperature: 0.3, // Lower temperature for more consistent analysis
      model: config.azureOpenAI.modelName
    });

    console.log('✅ Received response from Azure OpenAI');

    const content = response.choices[0].message.content;
    console.log('📄 Raw AI response length:', content.length);
    
    const result = extractJSONFromResponse(content);
    console.log('✅ Successfully extracted JSON from AI response');
    
    return result;
  } catch (error) {
    console.error("❌ Q&A Dashboard Analysis Error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return a fallback response if AI fails
    return {
      customerStatusAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      communicationQualityAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      teamPerformanceAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      businessRisksAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      actionableInsightsAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      trendAnalysisAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      customerHappinessAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      teamFollowUpAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      problemHandlingAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again.",
      relaxationStatusAnswer: "Analysis temporarily unavailable. Please check your Azure OpenAI configuration and try again."
    };
  }
};

// Detailed Customer Analysis - ENHANCED
export const analyzeCustomerDetail = async (customerData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing detailed customer information for a customer success platform. This is a comprehensive analysis for executive decision-making.

  Provide a detailed JSON response with the following structure:
  {
    "satisfaction": 1-10 (based on sentiment analysis and email patterns),
    "happyPoints": ["Simple string describing what they're happy about", "Another simple string", "etc"],
    "unhappyPoints": ["Simple string describing their concerns", "Another simple string", "etc"],
    "activeProjects": ["Simple string describing current project", "Another simple string", "etc"],
    "waitingFor": ["Simple string describing what they're waiting for", "Another simple string", "etc"],
    "riskLevel": "low/medium/high (with specific reasoning)",
    "recommendations": ["Simple string recommendation", "Another simple string", "etc"]
  }
  
  IMPORTANT: All array items must be simple strings, not objects or complex structures.
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  COMPREHENSIVE CUSTOMER ANALYSIS DATA:
  
  Customer: ${customerData.name}
  Email Count: ${customerData.emailCount}
  Overall Sentiment: ${customerData.overallSentiment}
  Flagged Issues: ${customerData.flaggedIssues}
  Last Contact: ${customerData.lastEmailDate}
  Days Since Last Contact: ${Math.floor((new Date().getTime() - new Date(customerData.lastEmailDate).getTime()) / (1000 * 60 * 60 * 24))}
  
  RECENT EMAIL HISTORY (Last 10 interactions):
  ${customerData.recentEmails.map(email => `
  Date: ${email.timestamp}
  Subject: ${email.subject}
  Sentiment: ${email.sentiment}
  Summary: ${email.summary}
  Action Needed: ${email.actionNeeded}
  `).join('\n')}

  ANALYSIS REQUIREMENTS:
  - Provide comprehensive satisfaction assessment based on email patterns
  - Identify specific themes in positive and negative feedback
  - Assess current project status and timelines
  - Evaluate waiting items with urgency levels
  - Determine risk level with specific reasoning
  - Provide actionable recommendations with clear priorities
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 8000, // Increased for detailed analysis
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Customer Detail Analysis Error:", error);
    throw new Error("Failed to analyze customer detail");
  }
};

// Detailed Employee Performance Analysis - ENHANCED
export const analyzeEmployeeDetail = async (employeeData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing detailed employee performance for a customer success team. This is a comprehensive analysis for management decision-making.

  Provide a detailed JSON response with the following structure:
  {
    "performanceScore": 0-100 (comprehensive assessment based on all metrics),
    "responsivenessScore": 0-100 (based on response times and customer feedback),
    "strengths": ["Simple string describing a strength", "Another simple string", "etc"],
    "areasForImprovement": ["Simple string describing an area for improvement", "Another simple string", "etc"],
    "recentActivity": ["Simple string describing recent activity", "Another simple string", "etc"],
    "customerSatisfaction": 0-100 (based on customer feedback and sentiment),
    "recommendations": ["Simple string recommendation", "Another simple string", "etc"]
  }
  
  IMPORTANT: All array items must be simple strings, not objects or complex structures.
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  COMPREHENSIVE EMPLOYEE PERFORMANCE DATA:
  
  Employee: ${employeeData.name}
  Role: ${employeeData.role}
  Total Tasks: ${employeeData.totalTasks}
  Completed Tasks: ${employeeData.completedTasks}
  Pending Tasks: ${employeeData.pendingTasks}
  Overdue Tasks: ${employeeData.overdueTasks}
  Avg Response Time: ${employeeData.avgReplyTime} minutes
  Active Status: ${employeeData.active}
  Last Active: ${employeeData.lastActive}
  Days Since Last Active: ${Math.floor((new Date().getTime() - new Date(employeeData.lastActive).getTime()) / (1000 * 60 * 60 * 24))}
  
  RECENT EMAIL HANDLING (Last 10 interactions):
  ${employeeData.recentEmails.map(email => `
  Date: ${email.timestamp}
  Customer: ${email.customerName}
  Subject: ${email.subject}
  Sentiment: ${email.sentiment}
  Reply Time: ${email.replyTimeMinutes} minutes
  `).join('\n')}

  PERFORMANCE METRICS:
  - Task Completion Rate: ${Math.round(employeeData.completedTasks/employeeData.totalTasks*100)}%
  - Overdue Task Rate: ${Math.round(employeeData.overdueTasks/employeeData.totalTasks*100)}%
  - Average Response Time: ${employeeData.avgReplyTime} minutes
  - Active Status: ${employeeData.active}

  ANALYSIS REQUIREMENTS:
  - Provide comprehensive performance assessment based on all available metrics
  - Identify specific strengths with examples and impact
  - Assess areas for improvement with specific recommendations
  - Evaluate recent activity and achievements
  - Determine customer satisfaction based on interaction quality
  - Provide actionable recommendations with clear priorities
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 8000, // Increased for detailed analysis
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Employee Detail Analysis Error:", error);
    throw new Error("Failed to analyze employee detail");
  }
};

// Comprehensive Batch Analysis for Daily Processing
export const performComprehensiveAnalysis = async (allData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are an expert AI analyst performing a comprehensive daily business analysis for a customer success platform. This analysis is performed once per day and should be thorough, detailed, and actionable.

  Your task is to provide executive-level insights based on extensive data analysis. You should:
  1. Analyze all customer interactions and sentiment patterns
  2. Assess employee performance and productivity metrics
  3. Identify trends, risks, and opportunities
  4. Provide specific, actionable recommendations
  5. Prioritize issues by urgency and business impact
  6. Consider both immediate actions and long-term strategic implications

  Provide a comprehensive JSON response with detailed analysis for each section.`;

  const userPrompt = `
  COMPREHENSIVE BUSINESS DATA FOR DAILY EXECUTIVE ANALYSIS:

  OVERALL METRICS:
  - Total Emails: ${allData.totalEmails}
  - Happy Emails: ${allData.happyEmails} (${Math.round(allData.happyEmails/allData.totalEmails*100)}%)
  - Neutral Emails: ${allData.neutralEmails} (${Math.round(allData.neutralEmails/allData.totalEmails*100)}%)
  - Unhappy Emails: ${allData.unhappyEmails} (${Math.round(allData.unhappyEmails/allData.totalEmails*100)}%)
  - Flagged Issues: ${allData.flaggedIssues}
  - Average Reply Time: ${allData.avgReplyTime} minutes
  - Total Customers: ${allData.totalCustomers}
  - Total Employees: ${allData.totalEmployees}

  CUSTOMER ANALYSIS (${allData.customers.length} customers):
  ${allData.customers.map(customer => `
  Customer: ${customer.name}
  - Email Count: ${customer.emailCount}
  - Sentiment: ${customer.overallSentiment}
  - Flagged Issues: ${customer.flaggedIssues}
  - Last Contact: ${customer.lastEmailDate}
  - Days Since Last Contact: ${Math.floor((new Date().getTime() - new Date(customer.lastEmailDate).getTime()) / (1000 * 60 * 60 * 24))}
  `).join('\n')}

  EMPLOYEE ANALYSIS (${allData.employees.length} employees):
  ${allData.employees.map(employee => `
  Employee: ${employee.name}
  - Role: ${employee.role}
  - Emails Handled: ${employee.emailCount}
  - Avg Response Time: ${employee.avgReplyTime} minutes
  - Active Status: ${employee.active}
  - Performance Score: ${employee.performanceScore || 'N/A'}%
  - Responsiveness Score: ${employee.responsivenessScore || 'N/A'}%
  - Task Completion Rate: ${Math.round(employee.completedTasks/employee.totalTasks*100)}%
  `).join('\n')}

  RECENT INTERACTIONS (Last 30 interactions):
  ${allData.recentEmails.slice(0, 30).map(email => `
  Date: ${email.timestamp}
  Customer: ${email.customerName}
  Employee: ${email.employeeName}
  Subject: ${email.subject}
  Sentiment: ${email.sentiment}
  Action Needed: ${email.actionNeeded}
  `).join('\n')}

  ANALYSIS REQUIREMENTS:
  - Provide comprehensive insights for executive decision-making
  - Identify critical issues requiring immediate attention
  - Assess customer satisfaction trends and patterns
  - Evaluate employee performance and productivity
  - Identify risks and opportunities
  - Provide specific, actionable recommendations with timelines
  - Consider both tactical and strategic implications
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 16000, // Maximum tokens for comprehensive analysis
      temperature: 0.2, // Very low temperature for consistent, analytical output
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Comprehensive Analysis Error:", error);
    throw new Error("Failed to perform comprehensive analysis");
  }
};

// Enhanced Daily Summary with Maximum Detail
export const generateEnhancedDailySummary = async (summaryData) => {
  const client = createAIClient();
  
  const systemPrompt = `You are generating a comprehensive daily executive summary for a customer success platform. This summary should be detailed, actionable, and suitable for executive decision-making.

  Create a comprehensive summary that includes:
  1. Executive Overview with key metrics and trends
  2. Customer Satisfaction Analysis with specific insights and patterns
  3. Employee Performance Assessment with individual and team metrics
  4. Critical Issues and Risk Assessment with priority levels
  5. Operational Metrics and Efficiency Analysis
  6. Strategic Recommendations with implementation timelines
  7. Success Stories and Positive Developments
  8. Action Items and Next Steps with clear ownership

  Use specific data points, percentages, and measurable metrics throughout.`;

  const userPrompt = `
  COMPREHENSIVE DAILY SUMMARY DATA:

  CUSTOMER METRICS:
  Total Customers: ${summaryData.totalCustomers}
  Happy Customers: ${summaryData.happyCustomers} (${Math.round(summaryData.happyCustomers/summaryData.totalCustomers*100)}%)
  Unhappy Customers: ${summaryData.unhappyCustomers} (${Math.round(summaryData.unhappyCustomers/summaryData.totalCustomers*100)}%)
  Neutral Customers: ${summaryData.totalCustomers - summaryData.happyCustomers - summaryData.unhappyCustomers}

  OPERATIONAL METRICS:
  Open Tasks: ${summaryData.openTasks}
  Overdue Tasks: ${summaryData.overdueTasks}
  Flagged Issues: ${summaryData.flaggedIssues}
  Average Response Time: ${summaryData.avgResponseTime || 'N/A'} minutes

  EMPLOYEE METRICS:
  Total Employees: ${summaryData.totalEmployees}
  Active Employees: ${summaryData.activeEmployees}
  Average Performance Score: ${summaryData.avgPerformanceScore || 'N/A'}%
  Average Responsiveness Score: ${summaryData.avgResponsivenessScore || 'N/A'}%

  ADDITIONAL CONTEXT:
  - This is a daily executive summary for strategic decision-making
  - Focus on actionable insights and measurable outcomes
  - Include specific recommendations with clear implementation steps
  - Assess both immediate priorities and long-term strategic implications
  - Provide risk assessment with mitigation strategies
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 12000, // Maximum tokens for comprehensive summary
      temperature: 0.3, // Lower temperature for consistent, professional output
      model: config.azureOpenAI.modelName
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Enhanced Daily Summary Generation Error:", error);
    throw new Error("Failed to generate enhanced daily summary");
  }
};

// Customer Topics Analysis - NEW
export const analyzeCustomerTopics = async (customerEmails) => {
  const client = createAIClient();
  
  const systemPrompt = `You are analyzing customer emails to identify distinct topics/issues. For each topic you identify, provide the following information:

  Provide a JSON response with the following structure:
  {
    "topics": [
      {
        "title": "Brief title for the topic (e.g., 'Website Bug Report', 'Feature Request', 'Billing Issue')",
        "snapshot": "1-2 line summary of what this topic is about",
        "category": "Type of topic (e.g., 'Bug Report', 'Feature Request', 'Billing', 'Support', 'General')",
        "priority": "low/medium/high (based on urgency and impact)",
        "status": "open/ongoing/closed (based on email conversation flow)",
        "relatedEmailIds": ["array of email IDs that relate to this topic"],
        "firstMentioned": "timestamp of when this topic was first mentioned",
        "confidence": 0.0-1.0 (how confident you are about this topic identification)
      }
    ]
  }
  
  Important:
  - Only identify distinct, meaningful topics (minimum 2 emails per topic)
  - Merge similar topics together
  - Set status to 'closed' only if there's clear resolution in the emails
  - Set status to 'ongoing' if there's active discussion
  - Set status to 'open' if topic was mentioned but not actively discussed
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Customer Email History for Topic Analysis:
  ${customerEmails.map(email => `
  Email ID: ${email.id}
  Date: ${email.timestamp}
  Subject: ${email.subject}
  Body: ${email.body}
  Sentiment: ${email.sentiment}
  `).join('\n')}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 8000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Customer Topics Analysis Error:", error);
    throw new Error("Failed to analyze customer topics");
  }
};

// Update Topic Status based on new emails - ENHANCED for automatic status detection
export const updateTopicStatus = async (topicData, newEmails) => {
  const client = createAIClient();
  
  const systemPrompt = `You are an AI system that automatically tracks and updates customer support topics based on email conversations. Your job is to detect status changes and provide intelligent updates.

  CRITICAL INSTRUCTIONS:
  1. ANALYZE the new emails to detect if the topic status should change
  2. Look for keywords and context that indicate progress or completion
  3. Automatically update the snapshot if there's significant new information
  4. Generate a final verdict with actionable suggestions when closing topics

  STATUS DETECTION RULES:
  - "open" → "ongoing": Customer replies, work starts, team assigned, investigation begins
  - "ongoing" → "closed": Problem solved, task completed, customer satisfied, "done", "fixed", "resolved"
  - "open" → "closed": Quick resolution, simple answer provided, customer thanked
  - Stay "ongoing": Work in progress, waiting for customer, partial completion
  - Stay "open": No response, topic mentioned but no action

  COMPLETION INDICATORS (should close topic):
  - "migrated successfully", "completed", "fixed", "resolved", "working now"
  - "thank you", "perfect", "great job", "issue resolved"
  - "deployed", "launched", "finished", "done"
  - Customer satisfaction expressed

  SNAPSHOT UPDATE TRIGGERS:
  - New important information about the topic
  - Progress updates
  - Changes in scope or requirements
  - Resolution details

  Provide a JSON response with the following structure:
  {
    "status": "open/ongoing/closed",
    "statusReason": "Brief explanation why status changed",
    "updatedSnapshot": "Updated 1-2 line summary (or keep existing if no update needed)",
    "snapshotChanged": true/false,
    "shouldClose": true/false,
    "finalVerdict": "If closing, provide comprehensive summary and future suggestions",
    "confidence": 0.0-1.0,
    "detectedKeywords": ["array", "of", "keywords", "that", "triggered", "status", "change"]
  }
  
  Respond with ONLY the JSON object, no markdown formatting or additional text.`;

  const userPrompt = `
  Current Topic:
  Title: ${topicData.title}
  Current Status: ${topicData.status}
  Current Snapshot: ${topicData.snapshot}
  Category: ${topicData.category}
  
  New Email Activity:
  ${newEmails.map(email => `
  Date: ${email.timestamp}
  Subject: ${email.subject}
  Body: ${email.body}
  Sentiment: ${email.sentiment}
  `).join('\n')}
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 4000,
      temperature: 0.3,
      model: config.azureOpenAI.modelName
    });

    const content = response.choices[0].message.content;
    return extractJSONFromResponse(content);
  } catch (error) {
    console.error("Topic Status Update Error:", error);
    throw new Error("Failed to update topic status");
  }
};

// Generate Final Verdict when topic is closed - NEW
export const generateTopicVerdict = async (topicData, allRelatedEmails) => {
  const client = createAIClient();
  
  const systemPrompt = `You are providing a final verdict and suggestions for a closed customer topic. 

  Provide a comprehensive analysis that includes:
  1. Summary of what happened with this topic
  2. How it was resolved (if applicable)
  3. Suggestions for preventing similar issues
  4. Recommendations for improving customer experience
  5. Any follow-up actions needed

  Keep it concise but actionable - this will be used by customer success teams.`;

  const userPrompt = `
  Closed Topic Details:
  Title: ${topicData.title}
  Category: ${topicData.category}
  Snapshot: ${topicData.snapshot}
  Duration: ${topicData.firstMentioned} to ${topicData.closedAt}
  
  All Related Email History:
  ${allRelatedEmails.map(email => `
  Date: ${email.timestamp}
  Subject: ${email.subject}
  Body: ${email.body}
  Sentiment: ${email.sentiment}
  `).join('\n')}
  
  Please provide a final verdict with actionable suggestions.
  `;

  try {
    const response = await client.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 6000,
      temperature: 0.4,
      model: config.azureOpenAI.modelName
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error("Topic Verdict Generation Error:", error);
    throw new Error("Failed to generate topic verdict");
  }
};

export default {
  analyzeEmail,
  analyzeCustomerSentiment,
  analyzeEmployeePerformance,
  generateDailySummary,
  generateEnhancedDailySummary,
  analyzeTaskPriority,
  analyzeQADashboard,
  analyzeCustomerDetail,
  analyzeEmployeeDetail,
  performComprehensiveAnalysis,
  analyzeCustomerTopics,
  updateTopicStatus,
  generateTopicVerdict
};
