import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Search, 
  User, 
  Target,
  Activity,
  Star,
  TrendingUp,
  Users,
  MessageSquare
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import type { EmployeePerformanceDetail } from '../../types/dashboard';

const EmployeeQueries: React.FC = () => {
  const [employeeQuery, setEmployeeQuery] = useState('');
  const [employeeResult, setEmployeeResult] = useState<EmployeePerformanceDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const searchEmployee = async () => {
    if (!employeeQuery.trim()) return;
    
    try {
      setLoading(true);
      // For demo purposes, we'll use a mock employee ID
      // In a real app, you'd search by name and get the ID
      const employeeId = 'employee-1'; // This would come from a search API
      const result = await dashboardApi.getEmployeeAnalysis(employeeId);
      setEmployeeResult(result);
    } catch (error) {
      console.error('Error searching employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Employee Performance Queries</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">Get detailed insights about specific employee performance and productivity</p>
      </div>

      {/* Employee Query Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Employee Query: "What's the status on X employee?"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter employee name..."
              value={employeeQuery}
              onChange={(e) => setEmployeeQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchEmployee()}
            />
            <Button onClick={searchEmployee} disabled={loading || !employeeQuery.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {employeeResult && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-xl">{employeeResult.name}</h3>
                  <span className="text-sm text-gray-600">{employeeResult.role}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    employeeResult.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {employeeResult.active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employeeResult.performanceScore)}`}>
                    Performance: {employeeResult.performanceScore}%
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPerformanceColor(employeeResult.responsivenessScore)}`}>
                    Responsiveness: {employeeResult.responsivenessScore}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center bg-white p-3 rounded">
                  <div className="text-lg font-bold">{employeeResult.totalTasks}</div>
                  <div className="text-xs text-gray-600">Total Tasks</div>
                </div>
                <div className="text-center bg-white p-3 rounded">
                  <div className="text-lg font-bold text-green-600">{employeeResult.completedTasks}</div>
                  <div className="text-xs text-gray-600">Completed</div>
                </div>
                <div className="text-center bg-white p-3 rounded">
                  <div className="text-lg font-bold text-yellow-600">{employeeResult.pendingTasks}</div>
                  <div className="text-xs text-gray-600">Pending</div>
                </div>
                <div className="text-center bg-white p-3 rounded">
                  <div className="text-lg font-bold text-red-600">{employeeResult.overdueTasks}</div>
                  <div className="text-xs text-gray-600">Overdue</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Star className="h-4 w-4 text-green-600" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {employeeResult.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-2">
                    {employeeResult.areasForImprovement.map((area, index) => (
                      <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  Recent Activity
                </h4>
                <ul className="space-y-2">
                  {employeeResult.recentActivity.map((activity, index) => (
                    <li key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Last Active: {new Date(employeeResult.lastActive).toLocaleDateString()}</span>
                <span>Customer Satisfaction: {employeeResult.customerSatisfaction}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Employee Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Team Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="text-xs text-muted-foreground">Active Employees</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">87%</div>
            <div className="text-xs text-muted-foreground">Team Average</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">2.3h</div>
            <div className="text-xs text-muted-foreground">Average Reply</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmployeeQueries;

