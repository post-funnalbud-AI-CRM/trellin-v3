import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { 
  Users, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle, 
  Calendar, 
  Mail, 
  Eye,
  TrendingUp,
  Clock
} from 'lucide-react';
import type { Customer } from '../../types/dashboard';

interface CustomerListProps {
  customers: Customer[];
}

const CustomerList: React.FC<CustomerListProps> = ({ customers }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'happy':
        return <Smile className="h-4 w-4 text-green-500" />;
      case 'unhappy':
        return <Frown className="h-4 w-4 text-red-500" />;
      default:
        return <Meh className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'happy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'unhappy':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getRiskLevel = (customer: Customer) => {
    if (customer.flaggedIssues) return 'high';
    if (customer.overallSentiment === 'unhappy') return 'medium';
    return 'low';
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{customers.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Happy Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {customers.filter(c => c.overallSentiment === 'happy').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unhappy Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Frown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">
                {customers.filter(c => c.overallSentiment === 'unhappy').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Flagged Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold">
                {customers.filter(c => c.flaggedIssues).length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Overview
          </CardTitle>
          <CardDescription>
            Detailed view of all customers with satisfaction levels and key metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {customers.map((customer) => {
              const riskLevel = getRiskLevel(customer);
              const lastEmailDate = customer.lastEmailDate 
                ? new Date(customer.lastEmailDate).toLocaleDateString()
                : 'No recent emails';

              return (
                <div
                  key={customer.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                    selectedCustomer?.id === customer.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedCustomer(customer)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(customer.overallSentiment)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{customer.name}</h3>
                          <p className="text-sm text-gray-600">{customer.primaryDomain}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge className={getSentimentColor(customer.overallSentiment)}>
                        {customer.overallSentiment}
                      </Badge>
                      
                      <Badge className={getRiskColor(riskLevel)}>
                        {riskLevel} risk
                      </Badge>

                      {customer.flaggedIssues && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Issues
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span>{customer.emailCount} emails</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>Last: {lastEmailDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>Active</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-gray-500" />
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>

                  {/* Customer Details (shown when selected) */}
                  {selectedCustomer?.id === customer.id && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Customer Insights</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Satisfaction:</span>
                              <Badge className={getSentimentColor(customer.overallSentiment)}>
                                {customer.overallSentiment}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Risk Level:</span>
                              <Badge className={getRiskColor(riskLevel)}>
                                {riskLevel}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">Email Activity:</span>
                              <span>{customer.emailCount} emails</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Key Metrics</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Engagement</span>
                              <Progress 
                                value={Math.min((customer.emailCount / 20) * 100, 100)} 
                                className="w-20 h-2" 
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-gray-600">Satisfaction</span>
                              <Progress 
                                value={
                                  customer.overallSentiment === 'happy' ? 100 :
                                  customer.overallSentiment === 'unhappy' ? 20 : 60
                                } 
                                className="w-20 h-2" 
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Full Profile
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

export default CustomerList;
