import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  Mail, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle, 
  Clock, 
  User, 
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  CheckCircle
} from 'lucide-react';

interface EmailInsightsProps {
  emails: Array<{
    id: string;
    subject: string;
    sentiment: 'happy' | 'neutral' | 'unhappy';
    timestamp: string;
    actionNeeded: boolean;
    customerName: string;
  }>;
}

const EmailInsights: React.FC<EmailInsightsProps> = ({ emails }) => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);

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

  const flaggedEmails = emails.filter(e => e.actionNeeded);
  const happyEmails = emails.filter(e => e.sentiment === 'happy');
  const unhappyEmails = emails.filter(e => e.sentiment === 'unhappy');


  return (
    <div className="space-y-6">
      {/* Email Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{emails.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Happy Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Smile className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{happyEmails.length}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Unhappy Emails</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Frown className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{unhappyEmails.length}</span>
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
              <span className="text-2xl font-bold">{flaggedEmails.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Analysis & Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of customer emails with sentiment and action recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emails.map((email) => (
              <div
                key={email.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                  selectedEmail === email.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedEmail(selectedEmail === email.id ? null : email.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getSentimentIcon(email.sentiment)}
                      <div>
                        <h3 className="font-semibold text-gray-900">{email.subject}</h3>
                        <p className="text-sm text-gray-600">{email.customerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge className={getSentimentColor(email.sentiment)}>
                      {email.sentiment}
                    </Badge>
                    
                    {email.actionNeeded ? (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Action Needed
                      </Badge>
                    ) : (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Handled
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{new Date(email.timestamp).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{new Date(email.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span>{email.customerName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-500" />
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>

                {/* Email Details (shown when selected) */}
                {selectedEmail === email.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Sentiment:</span>
                            <Badge className={getSentimentColor(email.sentiment)}>
                              {email.sentiment}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Priority:</span>
                            <Badge variant={email.actionNeeded ? "destructive" : "default"}>
                              {email.actionNeeded ? 'High' : 'Normal'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600">Status:</span>
                            <span className={email.actionNeeded ? 'text-red-600' : 'text-green-600'}>
                              {email.actionNeeded ? 'Needs Attention' : 'Resolved'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Recommended Actions</h4>
                        <div className="space-y-2 text-sm">
                          {email.actionNeeded ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-red-600">
                                <AlertTriangle className="h-3 w-3" />
                                <span>Immediate response required</span>
                              </div>
                              <div className="flex items-center gap-2 text-orange-600">
                                <Clock className="h-3 w-3" />
                                <span>Follow up within 24 hours</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              <span>No action required</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-1" />
                        View Full Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                      <Button size="sm" variant="outline">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Analytics
                      </Button>
                      {email.actionNeeded && (
                        <Button size="sm" variant="destructive">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Mark as Urgent
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailInsights;
