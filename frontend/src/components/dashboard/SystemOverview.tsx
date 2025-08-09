import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Database, 
  Server, 
  Shield, 
  Users, 
  BarChart3,
  Activity,
  Clock,
  Zap
} from 'lucide-react';

const SystemOverview: React.FC = () => {
  const { user } = useAuth();

  const systemMetrics = [
    {
      title: 'Authentication',
      value: 'Active',
      description: 'Successfully authenticated',
      icon: CheckCircle,
      status: 'success'
    },
    {
      title: 'Backend API',
      value: 'Connected',
      description: 'Running on localhost:3001',
      icon: Server,
      status: 'success'
    },
    {
      title: 'Database',
      value: 'Ready',
      description: 'Schema created and ready',
      icon: Database,
      status: 'success'
    },
    {
      title: 'AI Service',
      value: 'Operational',
      description: 'Azure OpenAI connected',
      icon: Zap,
      status: 'success'
    }
  ];

  const quickStats = [
    {
      title: 'Total Users',
      value: '1,234',
      change: '+12%',
      icon: Users
    },
    {
      title: 'Active Sessions',
      value: '56',
      change: '+8%',
      icon: Activity
    },
    {
      title: 'Response Time',
      value: '245ms',
      change: '-15%',
      icon: Clock
    },
    {
      title: 'Success Rate',
      value: '99.9%',
      change: '+0.1%',
      icon: BarChart3
    }
  ];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Welcome Section */}
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 sm:h-16 sm:w-16 bg-primary rounded-full flex items-center justify-center mb-4">
            <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl sm:text-2xl md:text-3xl">Welcome to Trellin</CardTitle>
          <CardDescription className="text-sm sm:text-lg">
            AI-Powered Customer Success Platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs sm:text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-lg sm:text-xl md:text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}>
                  {stat.change}
                </span>
                {' '}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <metric.icon className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{metric.value}</div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Online
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>
            Current authenticated user details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Name</p>
              <p className="text-lg font-semibold">{user?.name}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="text-lg font-semibold">{user?.email}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Role</p>
              <Badge variant="outline" className="capitalize">
                {user?.role}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">User ID</p>
              <p className="text-sm font-mono text-muted-foreground">{user?.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Ready Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                System Ready
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              All systems operational. Platform ready for full usage.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;
