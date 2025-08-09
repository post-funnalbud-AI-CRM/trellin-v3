import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LogOut, User, Shield, CheckCircle, Database, Server, BarChart3, Users, Activity, Search, Brain } from 'lucide-react';
import QuestionAnswerDashboard from './dashboard/QuestionAnswerDashboard';
import CustomerSuccessDashboard from './dashboard/CustomerSuccessDashboard';
import SpecificQueries from './dashboard/SpecificQueries';
import ComprehensiveAnalysis from './dashboard/ComprehensiveAnalysis';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'overview' | 'questions' | 'detailed' | 'specific' | 'comprehensive'>('questions');

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">Trellin</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="text-gray-900">{user?.name}</span>
                <Shield className="h-4 w-4 text-gray-600" />
                <span className="text-gray-600 capitalize">{user?.role}</span>
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveView('questions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'questions'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Question & Answer Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveView('comprehensive')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'comprehensive'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Comprehensive Analysis
              </div>
            </button>
            <button
              onClick={() => setActiveView('specific')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'specific'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Specific Queries
              </div>
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'detailed'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Detailed Customer Success
              </div>
            </button>
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeView === 'overview'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                System Overview
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {activeView === 'questions' && <QuestionAnswerDashboard />}
      {activeView === 'comprehensive' && <ComprehensiveAnalysis />}
      {activeView === 'specific' && <SpecificQueries />}
      {activeView === 'detailed' && <CustomerSuccessDashboard />}
      {activeView === 'overview' && (
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="space-y-6">
              {/* Welcome Section */}
              <Card className="bg-white border border-gray-200">
                <CardHeader className="text-center">
                  <div className="mx-auto h-16 w-16 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-3xl text-gray-900">Welcome to Trellin Dashboard</CardTitle>
                  <CardDescription className="text-lg text-gray-600">
                    AI-Powered Customer Success Platform
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Authentication</CardTitle>
                    <CheckCircle className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-700">Success</div>
                    <p className="text-xs text-gray-600">
                      Successfully authenticated as admin
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Backend API</CardTitle>
                    <Server className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-700">Connected</div>
                    <p className="text-xs text-gray-600">
                      Backend running on localhost:3001
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white border border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-900">Database</CardTitle>
                    <Database className="h-4 w-4 text-gray-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-700">Ready</div>
                    <p className="text-xs text-gray-600">
                      Database schema created and ready
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* User Information */}
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">User Information</CardTitle>
                  <CardDescription className="text-gray-600">
                    Current authenticated user details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Name</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Role</p>
                      <p className="text-lg font-semibold text-gray-900 capitalize">{user?.role}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">User ID</p>
                      <p className="text-lg font-mono text-sm text-gray-900">{user?.id}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="bg-white border border-gray-200">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Ready for Phase 1: Adding dummy data and building the full dashboard
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Dashboard;
