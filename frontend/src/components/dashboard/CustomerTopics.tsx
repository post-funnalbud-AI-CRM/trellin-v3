import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  MessageCircle,
  AlertCircle,
  CheckCircle,
  Clock,
  Play,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Bot,

  Filter,
  RefreshCw
} from 'lucide-react';
import { topicsApi, dashboardApi } from '../../services/api';
import type { CustomerTopic, Customer } from '../../types/dashboard';

const CustomerTopics: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [topics, setTopics] = useState<CustomerTopic[]>([]);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (selectedCustomerId) {
      loadCustomerTopics();

    }
  }, [selectedCustomerId]);

  const loadCustomers = async () => {
    try {
      const customersData = await dashboardApi.getCustomers();
      setCustomers(customersData);
      if (customersData.length > 0) {
        setSelectedCustomerId(customersData[0].id);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadCustomerTopics = async () => {
    if (!selectedCustomerId) return;
    
    try {
      setLoading(true);
      const topicsData = await topicsApi.getCustomerTopics(selectedCustomerId);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading customer topics:', error);
    } finally {
      setLoading(false);
    }
  };



  const analyzeTopics = async () => {
    if (!selectedCustomerId) return;
    
    try {
      setAnalyzing(true);
      const result = await topicsApi.analyzeCustomerTopics(selectedCustomerId);
      console.log('Topics analyzed:', result);
      
      // Reload topics and stats
      await loadCustomerTopics();

    } catch (error) {
      console.error('Error analyzing topics:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Status updates are now handled automatically by AI processing

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="h-4 w-4" />;
      case 'ongoing': return <Play className="h-4 w-4" />;
      case 'closed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-blue-100 text-blue-800';
      case 'ongoing': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <ArrowUpRight className="h-4 w-4" />;
      case 'medium': return <Minus className="h-4 w-4" />;
      case 'low': return <ArrowDownRight className="h-4 w-4" />;
      default: return <Minus className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTopics = topics.filter(topic => {
    const statusMatch = statusFilter === 'all' || topic.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || topic.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="p-2 space-y-2">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
                      <div className="p-1 bg-blue-50 border border-blue-200 rounded text-xs">
              <p className="text-blue-700">
                🤖 <strong>Auto-managed by AI</strong>
              </p>
            </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadCustomerTopics}
            variant="outline"
            size="sm"
            disabled={loading}
            className="h-6 px-2 text-xs"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={analyzeTopics}
            disabled={analyzing || !selectedCustomerId}
            size="sm"
            className="h-6 px-2 text-xs"
          >
            <Bot className={`h-3 w-3 mr-1 ${analyzing ? 'animate-spin' : ''}`} />
            {analyzing ? 'Analyzing...' : 'Analyze'}
          </Button>
        </div>
      </div>

      {/* Customer Selection */}
      <Card>
        <CardContent className="p-2">
          <div className="flex gap-2 flex-wrap">
            {customers.map((customer) => (
              <Button
                key={customer.id}
                onClick={() => setSelectedCustomerId(customer.id)}
                variant={selectedCustomerId === customer.id ? "default" : "outline"}
                size="sm"
                className="h-6 px-2 text-xs"
              >
                {customer.name}
                <Badge variant="secondary" className="ml-1 text-xs h-4 px-1">
                  {customer.emailCount}
                </Badge>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>



      {/* Filters */}
      <Card>
        <CardContent className="p-0 h-5">
          <div className="flex gap-2 items-center text-xs">
            <div className="flex items-center gap-0.5">
              <Filter className="h-3 w-3" />
              <span className="font-medium text-xs">Filters:</span>
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-1 py-0 border rounded text-xs h-5 min-w-16"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="ongoing">Ongoing</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-1 py-0 border rounded text-xs h-5 min-w-16"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="text-xs text-muted-foreground ml-auto">
              {filteredTopics.length}/{topics.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardContent className="p-2">
          {loading ? (
            <div className="flex items-center justify-center p-2">
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : filteredTopics.length === 0 ? (
            <div className="text-center p-2 text-muted-foreground">
              {topics.length === 0 ? (
                <div>
                  <MessageCircle className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No topics found. Click "Analyze" to generate.</p>
                </div>
              ) : (
                <div>
                  <Filter className="h-6 w-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No topics match filters.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">Customer</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">Topic</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">Snapshot</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">Status</th>
                    <th className="border border-gray-300 px-1 py-0.5 text-left font-semibold text-xs">Latest Update Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTopics.map((topic, index) => (
                    <tr 
                      key={topic.id} 
                      className={`hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                    >
                      {/* Customer Column */}
                      <td className="border border-gray-300 px-1 py-1">
                        <div className="flex items-center gap-1">
                          <span className="font-medium text-xs">{selectedCustomer?.name}</span>
                          <Badge variant="secondary" className="text-xs h-4 px-1">
                            {topic.relatedEmails?.length || 0}
                          </Badge>
                        </div>
                      </td>

                      {/* Topic Column */}
                      <td className="border border-gray-300 px-1 py-1">
                        <div className="space-y-0.5">
                          <div className="font-semibold text-xs">{topic.title}</div>
                          <div className="flex items-center gap-1 flex-wrap">
                            <Badge className={getPriorityColor(topic.priority)} variant="outline">
                              {getPriorityIcon(topic.priority)}
                              <span className="ml-0.5 text-xs">{topic.priority}</span>
                            </Badge>
                            {topic.category && (
                              <Badge variant="outline" className="text-xs h-4 px-1">{topic.category}</Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {Math.round((topic.aiConfidence || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Snapshot Column */}
                      <td className="border border-gray-300 px-1 py-1">
                        <div className="text-xs text-gray-700 max-w-sm">
                          {topic.snapshot}
                          {topic.finalVerdict && (
                            <div className="mt-1 p-1 bg-green-50 border border-green-200 rounded text-xs">
                              <strong>Verdict:</strong> {topic.finalVerdict.substring(0, 80)}...
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Status Column */}
                      <td className="border border-gray-300 px-1 py-1">
                        <div className="space-y-0.5">
                          <Badge className={getStatusColor(topic.status)}>
                            {getStatusIcon(topic.status)}
                            <span className="ml-1 text-xs">{topic.status}</span>
                          </Badge>
                          <div className="text-xs text-gray-400 italic">
                            Auto-managed by AI
                          </div>
                        </div>
                      </td>

                      {/* Latest Update Date Column */}
                      <td className="border border-gray-300 px-1 py-1">
                        <div className="text-xs space-y-1">
                          <div>
                            <span className="font-medium">Updated:</span> {new Date(topic.lastUpdated).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            <span>Created:</span> {new Date(topic.firstMentioned).toLocaleDateString()}
                          </div>
                          {topic.closedAt && (
                            <div className="text-xs text-green-600">
                              <span>Closed:</span> {new Date(topic.closedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerTopics;
