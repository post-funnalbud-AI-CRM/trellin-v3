import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  Mail,
  Activity,
  Calendar,
  Eye
} from 'lucide-react';
import type { Employee } from '../../types/dashboard';

interface EmployeePerformanceProps {
  employees: Employee[];
}

const EmployeePerformance: React.FC<EmployeePerformanceProps> = ({ employees }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const getPerformanceScore = (employee: Employee) => {
    const taskCompletion = (employee.completedTasks / Math.max(employee.totalTasks, 1)) * 100;
    const responsiveness = Math.max(100 - (employee.avgReplyTime / 60), 0); // Convert to hours
    const activity = employee.active ? 100 : 0;
    
    return Math.round((taskCompletion + responsiveness + activity) / 3);
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getPerformanceLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Poor';
  };

  const getResponseTimeColor = (time: number) => {
    if (time <= 30) return 'text-green-600';
    if (time <= 120) return 'text-yellow-600';
    return 'text-red-600';
  };

  const activeEmployees = employees.filter(e => e.active).length;
  const avgResponseTime = employees.reduce((sum, e) => sum + (e.avgReplyTime || 0), 0) / employees.length || 0;
  const avgCompletionRate = employees.reduce((sum, e) => sum + (e.completedTasks / Math.max(e.totalTasks, 1)), 0) / employees.length * 100 || 0;

  return (
    <div className="space-y-6">
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{employees.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{activeEmployees}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">{Math.round(avgResponseTime)} min</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{Math.round(avgCompletionRate)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Performance Report
          </CardTitle>
          <CardDescription>
            Detailed view of employee performance, responsiveness, and task completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {employees.map((employee) => {
              const performanceScore = getPerformanceScore(employee);
              const performanceLabel = getPerformanceLabel(performanceScore);
              const lastActiveDate = employee.lastActive 
                ? new Date(employee.lastActive).toLocaleDateString()
                : 'Unknown';

              return (
                <div
                  key={employee.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedEmployee?.id === employee.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {employee.active ? (
                          <UserCheck className="h-5 w-5 text-green-500" />
                        ) : (
                          <UserX className="h-5 w-5 text-red-500" />
                        )}
                        <div>
                          <h3 className="font-semibold text-gray-900">{employee.name}</h3>
                          <p className="text-sm text-gray-600">{employee.email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getPerformanceColor(performanceScore)}>
                        {performanceLabel}
                      </Badge>
                      
                      <Badge variant={employee.active ? "default" : "secondary"}>
                        {employee.active ? 'Active' : 'Inactive'}
                      </Badge>

                      <div className="text-right">
                        <div className="text-sm font-medium">{performanceScore}%</div>
                        <div className="text-xs text-gray-500">Performance</div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-gray-500" />
                      <span>{employee.completedTasks}/{employee.totalTasks} tasks</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className={getResponseTimeColor(employee.avgReplyTime)}>
                        {Math.round(employee.avgReplyTime)} min avg
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{employee.emailCount} emails</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Last: {lastActiveDate}</span>
                    </div>
                  </div>

                  {/* Employee Details (shown when selected) */}
                  {selectedEmployee?.id === employee.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Task Completion</span>
                                <span className="font-medium">
                                  {Math.round((employee.completedTasks / Math.max(employee.totalTasks, 1)) * 100)}%
                                </span>
                              </div>
                              <Progress 
                                value={(employee.completedTasks / Math.max(employee.totalTasks, 1)) * 100} 
                                className="h-2" 
                              />
                            </div>
                            
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Response Time</span>
                                <span className={`font-medium ${getResponseTimeColor(employee.avgReplyTime)}`}>
                                  {Math.round(employee.avgReplyTime)} min avg
                                </span>
                              </div>
                              <Progress 
                                value={Math.max(100 - (employee.avgReplyTime / 60), 0)} 
                                className="h-2" 
                              />
                            </div>

                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Activity Status</span>
                                <Badge variant={employee.active ? "default" : "secondary"}>
                                  {employee.active ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Key Insights</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Performance Score:</span>
                              <Badge className={getPerformanceColor(performanceScore)}>
                                {performanceScore}% - {performanceLabel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Responsiveness:</span>
                              <span className={getResponseTimeColor(employee.avgReplyTime)}>
                                {employee.avgReplyTime <= 30 ? 'Excellent' : 
                                 employee.avgReplyTime <= 120 ? 'Good' : 'Needs Improvement'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Email Activity:</span>
                              <span>{employee.emailCount} emails handled</span>
                            </div>
                            {employee.avgReplyTime > 120 && (
                              <div className="flex items-center gap-2 text-orange-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Slow response time - consider training</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Profile
                        </Button>
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          Performance History
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4 mr-1" />
                          Email History
                        </Button>
                        <Button size="sm" variant="outline">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeePerformance;
