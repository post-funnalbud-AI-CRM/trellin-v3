import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  Brain, 
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Users,
  UserCheck,
  Target,
  Star
} from 'lucide-react';
import { dashboardApi } from '../../services/api';

const ComprehensiveAnalysis: React.FC = () => {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  useEffect(() => {
    loadComprehensiveAnalysis();
  }, []);

  const loadComprehensiveAnalysis = async () => {
    try {
      setLoading(true);
      setAnalysisLoading(true);
      const data = await dashboardApi.getComprehensiveAnalysis();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error loading comprehensive analysis:', error);
    } finally {
      setLoading(false);
      setAnalysisLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading comprehensive analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Comprehensive Business Analysis</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">AI-powered executive insights with maximum detail and analysis depth</p>
      </div>

      {/* Metrics Overview */}
      {analysisData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Executive Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{analysisData.metrics.totalEmails}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Interactions</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{analysisData.metrics.happyCustomers}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{analysisData.metrics.unhappyCustomers}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Unhappy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{analysisData.metrics.totalEmployees}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Total Employees</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{analysisData.metrics.activeEmployees}</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Employees</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{analysisData.metrics.avgReplyTime}h</div>
                <div className="text-xs sm:text-sm text-muted-foreground">Avg Response</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Analysis Results */}
      {analysisData?.analysis && (
        <div className="space-y-6">
          {/* Customer Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Satisfaction Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Customer Satisfaction Overview</h3>
                  <p className="text-blue-800 leading-relaxed">
                    {analysisData.analysis.customerSatisfaction || 
                     "Comprehensive analysis of customer satisfaction patterns, trends, and specific feedback themes. Detailed assessment of customer happiness levels with actionable insights for improvement."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Employee Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Employee Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Team Performance Assessment</h3>
                  <p className="text-green-800 leading-relaxed">
                    {analysisData.analysis.employeePerformance || 
                     "Comprehensive evaluation of employee performance metrics, productivity trends, and individual contribution analysis. Detailed assessment of team effectiveness with specific improvement recommendations."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Assessment & Critical Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-2">Risk Analysis</h3>
                  <p className="text-orange-800 leading-relaxed">
                    {analysisData.analysis.riskAssessment || 
                     "Comprehensive risk assessment with identification of critical issues requiring immediate attention. Detailed analysis of potential threats and mitigation strategies with priority levels."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Operational Efficiency */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Operational Efficiency & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Operational Analysis</h3>
                  <p className="text-purple-800 leading-relaxed">
                    {analysisData.analysis.operationalEfficiency || 
                     "Detailed analysis of operational efficiency metrics, response time trends, and process optimization opportunities. Comprehensive assessment of workflow effectiveness and improvement areas."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Strategic Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-2">Actionable Insights</h3>
                  <p className="text-indigo-800 leading-relaxed">
                    {analysisData.analysis.strategicRecommendations || 
                     "Comprehensive strategic recommendations with prioritized action items and implementation timelines. Detailed roadmap for business improvement with measurable outcomes and success metrics."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Stories */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Success Stories & Positive Developments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">Positive Highlights</h3>
                  <p className="text-emerald-800 leading-relaxed">
                    {analysisData.analysis.successStories || 
                     "Comprehensive overview of success stories, positive customer feedback, and notable achievements. Detailed analysis of what's working well and opportunities to replicate success patterns."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Refresh Button */}
      {analysisData && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Last updated: {new Date(analysisData.lastUpdated).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Using maximum AI analysis tokens for comprehensive insights
                </p>
              </div>
              <button
                onClick={loadComprehensiveAnalysis}
                disabled={analysisLoading}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {analysisLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                ) : (
                  <Brain className="h-4 w-4" />
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

export default ComprehensiveAnalysis;
