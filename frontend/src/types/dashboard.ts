export interface Email {
  id: string;
  subject: string;
  body: string;
  fromEmail: string;
  toEmail: string;
  timestamp: string;
  sentiment: 'happy' | 'neutral' | 'unhappy';
  summary: string;
  actionNeeded: boolean;
  replied: boolean;
  replyTimeMinutes: number | null;
  customerName: string;
  employeeName: string;
}

export interface EmailInsight {
  emailId: string;
  sentiment: 'happy' | 'neutral' | 'unhappy';
  summary: string;
  waitingFor: string;
  recommendedAction: string;
  isFlagged: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  primaryDomain: string;
  overallSentiment: 'happy' | 'neutral' | 'unhappy';
  satisfaction: number; // 1-10 scale
  flaggedIssues: boolean;
  emailCount: number;
  lastEmailDate: string;
  needsFollowUp: boolean;
  lastContactDays: number;
  happyPoints?: string[];
  unhappyPoints?: string[];
  activeProjects?: string;
  waitingFor?: string;
}

export interface CustomerSentimentAnalysis {
  customerId: string;
  emailCount: number;
  analysis: {
    overallSentiment: 'happy' | 'neutral' | 'unhappy';
    keyConcerns: string[];
    positiveAspects: string[];
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastActive: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  responsivenessScore: number;
  responseTime: number; // in hours
  performanceScore: number; // percentage
  active: boolean;
  emailCount: number;
  avgReplyTime: number;
}

export interface DashboardSummary {
  summary: {
    totalEmails: number;
    totalCustomers: number;
    totalEmployees: number;
    flaggedEmails: number;
  };
  sentimentDistribution: Array<{
    sentiment: 'happy' | 'neutral' | 'unhappy';
    count: number;
  }>;
  recentEmails: Array<{
    id: string;
    subject: string;
    sentiment: 'happy' | 'neutral' | 'unhappy';
    timestamp: string;
    actionNeeded: boolean;
    customerName: string;
  }>;
  flaggedEmails: Array<{
    id: string;
    subject: string;
    sentiment: 'happy' | 'neutral' | 'unhappy';
    timestamp: string;
    customerName: string;
  }>;
}

export interface DailySummary {
  date: string;
  metrics: {
    totalCustomers: number;
    happyCustomers: number;
    unhappyCustomers: number;
    openTasks: number;
    overdueTasks: number;
    flaggedIssues: number;
  };
  summary: string;
}

export interface DashboardMetrics {
  totalEmails: number;
  happyEmails: number;
  neutralEmails: number;
  unhappyEmails: number;
  flaggedEmails: number;
  totalCustomers: number;
  happyCustomers: number;
  unhappyCustomers: number;
  totalEmployees: number;
  activeEmployees: number;
  avgResponseTime: number;
  completionRate: number;
}

export interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  customerId?: string;
  employeeId?: string;
}

export interface QAAnalysis {
  customerStatusAnswer: string;
  communicationQualityAnswer: string;
  teamPerformanceAnswer: string;
  businessRisksAnswer: string;
  actionableInsightsAnswer: string;
  trendAnalysisAnswer: string;
  // New specific questions
  customerHappinessAnswer: string;
  teamFollowUpAnswer: string;
  problemHandlingAnswer: string;
  relaxationStatusAnswer: string;
}

export interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  satisfaction: number; // 1-10 scale
  overallSentiment: 'happy' | 'neutral' | 'unhappy';
  happyPoints: string[];
  unhappyPoints: string[];
  activeProjects: string[];
  waitingFor: string[];
  lastContactDate: string;
  emailCount: number;
  needsFollowUp: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface EmployeePerformanceDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  performanceScore: number; // 0-100
  responsivenessScore: number; // 0-100
  avgResponseTime: number; // in hours
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  active: boolean;
  lastActive: string;
  strengths: string[];
  areasForImprovement: string[];
  recentActivity: string[];
  customerSatisfaction: number; // 0-100
}

export interface QADashboardData {
  metrics: {
    totalEmails: number;
    happyEmails: number;
    neutralEmails: number;
    unhappyEmails: number;
    flaggedIssues: number;
    avgReplyTime: number;
    totalCustomers: number;
    happyCustomers: number;
    unhappyCustomers: number;
    totalEmployees: number;
    activeEmployees: number;
  };
  analysis: QAAnalysis;
  customerDetails: CustomerDetail[];
  employeePerformance: EmployeePerformanceDetail[];
  lastUpdated: string;
}

// Customer Topics Types
export interface CustomerTopic {
  id: string;
  customerId: string;
  userId: string;
  title: string;
  snapshot: string;
  status: 'open' | 'ongoing' | 'closed';
  priority: 'low' | 'medium' | 'high';
  category: string;
  relatedEmails: string[];
  firstMentioned: string;
  lastUpdated: string;
  closedAt?: string;
  finalVerdict?: string;
  aiConfidence: number;
  createdAt: string;
  customerName?: string;
}

export interface TopicStats {
  totalTopics: number;
  statusDistribution: Array<{ status: string; count: number }>;
  categoryDistribution: Array<{ category: string; count: number }>;
  priorityDistribution: Array<{ priority: string; count: number }>;
}

export interface TopicsOverview {
  topics: CustomerTopic[];
  totalCount: number;
}
