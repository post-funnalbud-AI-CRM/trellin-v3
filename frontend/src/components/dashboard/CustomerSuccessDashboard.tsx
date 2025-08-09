import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Mail, 
  Activity,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Eye,
  BarChart3
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import type { DashboardSummary, Customer, Employee, DailySummary } from '../../types/dashboard';
import CustomerList from './CustomerList';
import EmployeePerformance from './EmployeePerformance';
import EmailInsights from './EmailInsights';
import DailySummaryCard from './DailySummaryCard';


const CustomerSuccessDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [dashboard, customersData, employeesData, dailySummaryData] = await Promise.all([
        dashboardApi.getDashboard(),
        dashboardApi.getCustomers(),
        dashboardApi.getEmployees(),
        dashboardApi.getDailySummary(),
      ]);

      setDashboardData(dashboard);
      setCustomers(customersData);
      setEmployees(employeesData);
      setDailySummary(dailySummaryData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your customer success insights...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-foreground">Unable to load dashboard</h2>
          <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    );
  }

  const { summary, sentimentDistribution, recentEmails, flaggedEmails } = dashboardData;
  
  // Calculate metrics
  const happyEmails = sentimentDistribution.find(s => s.sentiment === 'happy')?.count || 0;
  const neutralEmails = sentimentDistribution.find(s => s.sentiment === 'neutral')?.count || 0;
  const unhappyEmails = sentimentDistribution.find(s => s.sentiment === 'unhappy')?.count || 0;
  
  const happyCustomers = customers.filter(c => c.overallSentiment === 'happy').length;
  const unhappyCustomers = customers.filter(c => c.overallSentiment === 'unhappy').length;


  const activeEmployees = employees.filter(e => e.active).length;
  const avgResponseTime = employees.reduce((sum, e) => sum + (e.avgReplyTime || 0), 0) / employees.length || 0;
  const completionRate = employees.reduce((sum, e) => sum + (e.completedTasks / Math.max(e.totalTasks, 1)), 0) / employees.length * 100 || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Customer Success Dashboard</h1>
        <p className="text-lg text-muted-foreground">AI-powered insights to help you understand and improve customer satisfaction</p>
      </div>

      {/* Quick Status Cards - Answering the main questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* How is it going with my customers? */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5" />
              Customer Health
            </CardTitle>
            <CardDescription>Overall customer satisfaction status</CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Happy Customers</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {happyCustomers}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unhappy Customers</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    {unhappyCustomers}
                  </Badge>
                </div>
                <Progress value={(happyCustomers / summary.totalCustomers) * 100} className="h-2 bg-gray-200" />
              </div>
            </CardContent>
          </Card>

        {/* Is there a problem I need to handle? */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5" />
              Urgent Issues
            </CardTitle>
            <CardDescription>Problems requiring immediate attention</CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Flagged Emails</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    {flaggedEmails.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unhappy Customers</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    {unhappyCustomers}
                  </Badge>
                </div>
                {flaggedEmails.length > 0 && (
                  <div className="text-xs text-gray-700 bg-gray-100 p-2 rounded border border-gray-200">
                    ⚠️ {flaggedEmails.length} issues need immediate attention
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        {/* Did my team follow up on everything? */}
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle className="h-5 w-5" />
              Team Performance
            </CardTitle>
            <CardDescription>Response and follow-up metrics</CardDescription>
          </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Employees</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    <UserCheck className="h-3 w-3 mr-1" />
                    {activeEmployees}/{summary.totalEmployees}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Avg Response Time</span>
                  <span className="text-sm font-medium text-gray-700">{Math.round(avgResponseTime)} min</span>
                </div>
                <Progress value={completionRate} className="h-2 bg-gray-200" />
                <span className="text-xs text-gray-500">Task completion rate</span>
              </div>
            </CardContent>
          </Card>

          {/* Are our customers happy? */}
          <Card className="border-l-4 border-l-gray-500 bg-white border border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-gray-900">
                <BarChart3 className="h-5 w-5 text-gray-500" />
                Sentiment Overview
              </CardTitle>
              <CardDescription className="text-gray-600">Email sentiment distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Happy Emails</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-300">
                    <ThumbsUp className="h-3 w-3 mr-1" />
                    {happyEmails}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Unhappy Emails</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                    <ThumbsDown className="h-3 w-3 mr-1" />
                    {unhappyEmails}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Neutral Emails</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-300">
                    <Users className="h-3 w-3 mr-1" />
                    {neutralEmails}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Daily Summary */}
        {dailySummary && (
          <div className="mb-8">
            <DailySummaryCard summary={dailySummary} />
          </div>
        )}

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
            <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="customers" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
              <Users className="h-4 w-4" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="employees" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
              <UserCheck className="h-4 w-4" />
              Employees
            </TabsTrigger>
            <TabsTrigger value="emails" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-gray-900 text-gray-600">
              <Mail className="h-4 w-4" />
              Emails
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Activity className="h-5 w-5 text-gray-600" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-600">Latest customer interactions and updates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentEmails.slice(0, 5).map((email) => (
                      <div key={email.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          email.sentiment === 'happy' ? 'bg-gray-700' :
                          email.sentiment === 'unhappy' ? 'bg-gray-500' : 'bg-gray-600'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                          <p className="text-xs text-gray-600">{email.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(email.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        {email.actionNeeded && (
                          <Badge variant="outline" className="text-xs bg-gray-50 text-gray-600 border-gray-300">
                            Action Needed
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts and Issues */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <AlertTriangle className="h-5 w-5 text-gray-600" />
                    Alerts & Issues
                  </CardTitle>
                  <CardDescription className="text-gray-600">Problems requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {flaggedEmails.length > 0 ? (
                      flaggedEmails.slice(0, 5).map((email) => (
                        <div key={email.id} className="flex items-start gap-3 p-3 bg-gray-100 rounded-lg border border-gray-300">
                          <AlertTriangle className="h-4 w-4 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{email.subject}</p>
                            <p className="text-xs text-gray-700">{email.customerName}</p>
                            <p className="text-xs text-gray-600">
                              {new Date(email.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-12 w-12 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">No urgent issues to address</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers">
            <CustomerList customers={customers} />
          </TabsContent>

          <TabsContent value="employees">
            <EmployeePerformance employees={employees} />
          </TabsContent>

          <TabsContent value="emails">
            <EmailInsights emails={recentEmails} />
          </TabsContent>
        </Tabs>
      </div>
  );
};

export default CustomerSuccessDashboard;
