import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { 
  Search, 
  Users, 
  Clock,
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';
import { dashboardApi } from '../../services/api';
import type { CustomerDetail } from '../../types/dashboard';

const SpecificQueries: React.FC = () => {
  const [customerQuery, setCustomerQuery] = useState('');
  const [customerResult, setCustomerResult] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);

  const searchCustomer = async () => {
    if (!customerQuery.trim()) return;
    
    try {
      setLoading(true);
      // For demo purposes, we'll use a mock customer ID
      // In a real app, you'd search by name and get the ID
      const customerId = 'customer-1'; // This would come from a search API
      const result = await dashboardApi.getCustomerAnalysis(customerId);
      setCustomerResult(result);
    } catch (error) {
      console.error('Error searching customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSatisfactionColor = (satisfaction: number) => {
    if (satisfaction >= 8) return 'text-green-600';
    if (satisfaction >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-3 sm:p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground mb-2">Customer Queries</h1>
        <p className="text-sm sm:text-lg text-muted-foreground">Get detailed insights about specific customers and their satisfaction</p>
      </div>

      {/* Customer Query Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Query: "How is it going with X customer?"
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter customer name..."
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchCustomer()}
            />
            <Button onClick={searchCustomer} disabled={loading || !customerQuery.trim()}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {customerResult && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-xl">{customerResult.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSatisfactionColor(customerResult.satisfaction)}`}>
                    Satisfaction: {customerResult.satisfaction}/10
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    customerResult.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                    customerResult.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {customerResult.riskLevel.toUpperCase()} RISK
                  </span>
                  {customerResult.needsFollowUp && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      NEEDS FOLLOW-UP
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Happy About
                  </h4>
                  <ul className="space-y-2">
                    {customerResult.happyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-green-700 bg-green-50 p-2 rounded">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Unhappy About
                  </h4>
                  <ul className="space-y-2">
                    {customerResult.unhappyPoints.map((point, index) => (
                      <li key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Active Projects
                  </h4>
                  <ul className="space-y-2">
                    {customerResult.activeProjects.map((project, index) => (
                      <li key={index} className="text-sm text-blue-700 bg-blue-50 p-2 rounded">
                        {project}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-600" />
                    Waiting For
                  </h4>
                  <ul className="space-y-2">
                    {customerResult.waitingFor.map((item, index) => (
                      <li key={index} className="text-sm text-orange-700 bg-orange-50 p-2 rounded">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                <span>Last Contact: {new Date(customerResult.lastContactDate).toLocaleDateString()}</span>
                <span>{customerResult.emailCount} emails</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


    </div>
  );
};

export default SpecificQueries;
