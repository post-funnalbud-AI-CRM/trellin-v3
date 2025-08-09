import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Users, 
  Target,
  Clock,
  Zap
} from 'lucide-react';
import type { DailySummary } from '../../types/dashboard';

interface DailySummaryCardProps {
  summary: DailySummary;
}

const DailySummaryCard: React.FC<DailySummaryCardProps> = ({ summary }) => {
  const { date, metrics, summary: aiSummary } = summary;
  
  const getStatusColor = (happy: number, unhappy: number) => {
    const ratio = happy / Math.max(happy + unhappy, 1);
    if (ratio >= 0.7) return 'text-gray-700';
    if (ratio >= 0.5) return 'text-gray-600';
    return 'text-gray-500';
  };

  const getStatusIcon = (happy: number, unhappy: number) => {
    const ratio = happy / Math.max(happy + unhappy, 1);
    if (ratio >= 0.7) return <TrendingUp className="h-5 w-5 text-gray-700" />;
    if (ratio >= 0.5) return <AlertTriangle className="h-5 w-5 text-gray-600" />;
    return <TrendingDown className="h-5 w-5 text-gray-500" />;
  };

  const getStatusText = (happy: number, unhappy: number) => {
    const ratio = happy / Math.max(happy + unhappy, 1);
    if (ratio >= 0.7) return 'Excellent';
    if (ratio >= 0.5) return 'Good';
    return 'Needs Attention';
  };

  return (
    <Card className="border-l-4 border-l-gray-800 bg-white border border-gray-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900">
              <Calendar className="h-5 w-5 text-gray-800" />
              AI Daily Summary
            </CardTitle>
            <CardDescription className="text-gray-600">
              {new Date(date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(metrics.happyCustomers, metrics.unhappyCustomers)}
            <Badge variant="outline" className={`bg-gray-50 border-gray-300 ${getStatusColor(metrics.happyCustomers, metrics.unhappyCustomers)}`}>
              {getStatusText(metrics.happyCustomers, metrics.unhappyCustomers)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metrics */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">Key Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Users className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Customers</p>
                  <p className="text-lg font-semibold text-gray-700">{metrics.totalCustomers}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <CheckCircle className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Happy Customers</p>
                  <p className="text-lg font-semibold text-gray-700">{metrics.happyCustomers}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Unhappy Customers</p>
                  <p className="text-lg font-semibold text-gray-600">{metrics.unhappyCustomers}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Target className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">Open Tasks</p>
                  <p className="text-lg font-semibold text-gray-700">{metrics.openTasks}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Overdue Tasks</p>
                  <p className="text-lg font-semibold text-gray-600">{metrics.overdueTasks}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <AlertTriangle className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Flagged Issues</p>
                  <p className="text-lg font-semibold text-gray-600">{metrics.flaggedIssues}</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Summary */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 mb-3">AI Analysis</h3>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">AI-Generated Summary</span>
              </div>
              <div className="text-sm text-gray-700 leading-relaxed">
                {aiSummary.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Recommended Actions</h4>
              <div className="space-y-2 text-sm">
                {metrics.flaggedIssues > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Address {metrics.flaggedIssues} flagged issues immediately</span>
                  </div>
                )}
                {metrics.overdueTasks > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>Follow up on {metrics.overdueTasks} overdue tasks</span>
                  </div>
                )}
                {metrics.unhappyCustomers > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="h-3 w-3" />
                    <span>Reach out to {metrics.unhappyCustomers} unhappy customers</span>
                  </div>
                )}
                {metrics.happyCustomers > metrics.unhappyCustomers && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <CheckCircle className="h-3 w-3" />
                    <span>Maintain positive momentum with happy customers</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailySummaryCard;
