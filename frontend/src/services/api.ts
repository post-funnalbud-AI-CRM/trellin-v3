import axios from 'axios';
import type { 
  DashboardSummary, 
  Customer, 
  Employee, 
  Email, 
  CustomerSentimentAnalysis, 
  DailySummary,
  QADashboardData,
  CustomerDetail,
  EmployeePerformanceDetail
} from '../types/dashboard';

const API_BASE_URL = 'http://localhost:3001/api/v1';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Dashboard API
export const dashboardApi = {
  // Get dashboard summary
  getDashboard: async (): Promise<DashboardSummary> => {
    const response = await api.get('/insights/dashboard');
    return response.data.data;
  },

  // Get daily summary
  getDailySummary: async (): Promise<DailySummary> => {
    const response = await api.get('/insights/daily-summary');
    return response.data.data;
  },

  // Get all emails
  getEmails: async (): Promise<Email[]> => {
    const response = await api.get('/insights/emails');
    return response.data.data;
  },

  // Get email insights
  getEmailInsights: async (emailId: string) => {
    const response = await api.get(`/insights/emails/${emailId}/insights`);
    return response.data.data;
  },

  // Get customers
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/insights/customers');
    return response.data.data;
  },

  // Get customer sentiment analysis
  getCustomerSentiment: async (customerId: string): Promise<CustomerSentimentAnalysis> => {
    const response = await api.get(`/insights/customers/${customerId}/sentiment`);
    return response.data.data;
  },

  // Get specific customer analysis
  getCustomerAnalysis: async (customerId: string): Promise<CustomerDetail> => {
    const response = await api.get(`/insights/customers/${customerId}/analysis`);
    return response.data.data;
  },

  // Get employees
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get('/insights/employees');
    return response.data.data;
  },

  // Get specific employee analysis
  getEmployeeAnalysis: async (employeeId: string): Promise<EmployeePerformanceDetail> => {
    const response = await api.get(`/insights/employees/${employeeId}/analysis`);
    return response.data.data;
  },

  // Get Q&A dashboard analysis
  getQAAnalysis: async (): Promise<QADashboardData> => {
    const response = await api.get('/insights/qa-analysis');
    return response.data.data;
  },

  // Get comprehensive analysis with maximum tokens
  getComprehensiveAnalysis: async () => {
    const response = await api.get('/insights/comprehensive-analysis');
    return response.data.data;
  },

  // Get enhanced daily summary
  getEnhancedDailySummary: async (): Promise<DailySummary> => {
    const response = await api.get('/insights/daily-summary-enhanced');
    return response.data.data;
  },
};

// Topics API
export const topicsApi = {
  // Get topics for a customer
  getCustomerTopics: async (customerId: string) => {
    const response = await api.get(`/topics/customers/${customerId}/topics`);
    return response.data.data;
  },

  // Generate topics for a customer based on emails
  analyzeCustomerTopics: async (customerId: string) => {
    const response = await api.post(`/topics/customers/${customerId}/analyze-topics`);
    return response.data.data;
  },

  // Update topic status
  updateTopicStatus: async (topicId: string, status: string, snapshot?: string) => {
    const response = await api.put(`/topics/topics/${topicId}/status`, { status, snapshot });
    return response.data.data;
  },

  // Generate final verdict for closed topic
  generateTopicVerdict: async (topicId: string) => {
    const response = await api.post(`/topics/topics/${topicId}/generate-verdict`);
    return response.data.data;
  },

  // Update topics based on new emails
  updateTopicsFromEmails: async (customerId: string, newEmailIds: string[]) => {
    const response = await api.post(`/topics/customers/${customerId}/update-topics`, { newEmailIds });
    return response.data.data;
  },

  // Get topic statistics for a customer
  getCustomerTopicStats: async (customerId: string) => {
    const response = await api.get(`/topics/customers/${customerId}/topic-stats`);
    return response.data.data;
  },

  // Get overview of all topics
  getTopicsOverview: async () => {
    const response = await api.get('/topics/topics/overview');
    return response.data.data;
  },
};

// AI Analysis API
export const aiApi = {
  // Analyze email
  analyzeEmail: async (emailData: {
    subject: string;
    body: string;
    fromEmail: string;
    toEmail: string;
    timestamp?: string;
  }) => {
    const response = await api.post('/ai/analyze-email', emailData);
    return response.data.data;
  },

  // Analyze customer sentiment
  analyzeCustomerSentiment: async (customerId: string, emails: any[]) => {
    const response = await api.post('/ai/analyze-customer-sentiment', {
      customerId,
      emails,
    });
    return response.data.data;
  },

  // Generate daily summary
  generateDailySummary: async (summaryData: {
    totalCustomers: number;
    happyCustomers: number;
    unhappyCustomers: number;
    openTasks: number;
    overdueTasks: number;
    flaggedIssues: number;
  }) => {
    const response = await api.post('/ai/generate-daily-summary', summaryData);
    return response.data.data;
  },

  // Check AI health
  checkHealth: async () => {
    const response = await api.get('/ai/health');
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  devLogin: async () => {
    const response = await api.post('/auth/dev-login');
    return response.data;
  },

  register: async (userData: { name: string; email: string; password: string }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;
