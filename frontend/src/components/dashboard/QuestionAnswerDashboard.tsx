import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Users, 
  Activity,
  Star,
  MessageSquare,
  Smile,
  Frown,
  Clock,
  AlertTriangle,
  CheckCircle,
  UserCheck,
  Target,
  BarChart3
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import type { QADashboardData } from '../../types/dashboard';

const QuestionAnswerDashboard: React.FC = () => {
  const [qaData, setQaData] = useState<QADashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);



  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      await loadQAAnalysis();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQAAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      const qaAnalysis = await dashboardApi.getQAAnalysis();
      console.log('Q&A Analysis Data:', qaAnalysis);
      setQaData(qaAnalysis);
    } catch (error) {
      console.error('Error loading Q&A analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 8) return 'text-green-600';
    if (satisfaction >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'happy': return <Smile className="h-4 w-4 text-green-600" />;
      case 'unhappy': return <Frown className="h-4 w-4 text-red-600" />;
      default: return <MessageSquare className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">

      {/* Metrics Overview */}
      {qaData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Overview Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{qaData.metrics.totalEmails}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Emails</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{qaData.metrics.happyCustomers}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{qaData.metrics.unhappyCustomers}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Unhappy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{qaData.metrics.totalEmployees}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{qaData.metrics.activeEmployees}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Employees</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{qaData.metrics.avgReplyTime}h</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Reply</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Question 1: How is it going with my customers? */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              How is it going with my customers?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.customerStatusAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>

        {/* Question 2: Are our customers happy? */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Smile className="h-5 w-5" />
              Are our customers happy?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.customerHappinessAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>

        {/* Question 3: Is there a problem I need to handle? */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Is there a problem I need to handle?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.problemHandlingAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>

        {/* Question 4: Can I relax or take action? */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Can I relax or take action?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.relaxationStatusAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>

        {/* Question 5: Did my team follow up on everything? */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserCheck className="h-5 w-5" />
              Did my team follow up on everything?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.teamFollowUpAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>

        {/* Question 6: How is my team performing? */}
        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-5 w-5" />
              How is my team performing?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {analysisLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : qaData?.analysis ? (
              <p className="text-foreground leading-relaxed">{qaData.analysis.teamPerformanceAnswer}</p>
            ) : (
              <p className="text-muted-foreground italic">Loading analysis...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer List with Details */}
      {qaData?.customerDetails && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Customer Satisfaction Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qaData.customerDetails.map((customer) => (
                <div key={customer.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{customer.name}</h3>
                      {getSentimentIcon(customer.overallSentiment)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSatisfactionColor(customer.satisfaction)}`}>
                        Satisfaction: {customer.satisfaction}/10
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        customer.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        customer.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {customer.riskLevel.toUpperCase()} RISK
                      </span>
                      {customer.needsFollowUp && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          NEEDS FOLLOW-UP
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Happy About:</h4>
                      <ul className="space-y-1">
                        {customer.happyPoints?.map((point, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {typeof point === 'string' ? point : JSON.stringify(point)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Unhappy About:</h4>
                      <ul className="space-y-1">
                        {customer.unhappyPoints?.map((point, index) => (
                          <li key={index} className="text-sm text-red-700 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {typeof point === 'string' ? point : JSON.stringify(point)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Active Projects:</h4>
                      <ul className="space-y-1">
                        {customer.activeProjects?.map((project, index) => (
                          <li key={index} className="text-sm text-blue-700 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {typeof project === 'string' ? project : JSON.stringify(project)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Waiting For:</h4>
                      <ul className="space-y-1">
                        {customer.waitingFor?.map((item, index) => (
                          <li key={index} className="text-sm text-orange-700 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {typeof item === 'string' ? item : JSON.stringify(item)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Last Contact: {new Date(customer.lastContactDate).toLocaleDateString()}</span>
                    <span>{customer.emailCount} emails</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Employee Performance Report */}
      {qaData?.employeePerformance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Employee Performance Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qaData.employeePerformance.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <span className="text-sm text-gray-600">{employee.role}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        employee.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {employee.active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employee.performanceScore)}`}>
                        Performance: {employee.performanceScore}%
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employee.responsivenessScore)}`}>
                        Responsiveness: {employee.responsivenessScore}%
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold">{employee.totalTasks}</div>
                      <div className="text-xs text-gray-600">Total Tasks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">{employee.completedTasks}</div>
                      <div className="text-xs text-gray-600">Completed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-600">{employee.pendingTasks}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-red-600">{employee.overdueTasks}</div>
                      <div className="text-xs text-gray-600">Overdue</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Strengths:</h4>
                      <ul className="space-y-1">
                        {employee.strengths?.map((strength, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            {typeof strength === 'string' ? strength : JSON.stringify(strength)}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-gray-600 mb-2">Areas for Improvement:</h4>
                      <ul className="space-y-1">
                        {employee.areasForImprovement?.map((area, index) => (
                          <li key={index} className="text-sm text-orange-700 flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {typeof area === 'string' ? area : JSON.stringify(area)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm text-gray-600 mb-2">Recent Activity:</h4>
                    <ul className="space-y-1">
                      {employee.recentActivity?.map((activity, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {typeof activity === 'string' ? activity : JSON.stringify(activity)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                    <span>Last Active: {new Date(employee.lastActive).toLocaleDateString()}</span>
                    <span>Customer Satisfaction: {employee.customerSatisfaction}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Refresh Button */}
      {qaData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(qaData.lastUpdated).toLocaleString()}
                </p>
              </div>
              <button
                onClick={loadQAAnalysis}
                disabled={analysisLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analysisLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                ) : (
                  <Activity className="h-4 w-4" />
                )}
                {analysisLoading ? 'Analyzing...' : 'Refresh Analysis'}
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuestionAnswerDashboard;