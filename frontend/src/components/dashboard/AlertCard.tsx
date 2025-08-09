import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  XCircle
} from 'lucide-react';

interface AlertCardProps {
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  count?: number;
}

const AlertCard: React.FC<AlertCardProps> = ({ type, title, message, timestamp, count }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-gray-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-gray-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-gray-700" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-gray-300 bg-gray-50';
      case 'error':
        return 'border-gray-400 bg-gray-100';
      case 'warning':
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getBadgeColor = () => {
    switch (type) {
      case 'success':
        return 'bg-gray-50 text-gray-700 border-gray-300';
      case 'error':
        return 'bg-gray-100 text-gray-600 border-gray-400';
      case 'warning':
        return 'bg-gray-50 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-300';
    }
  };

  return (
    <Card className={`border-l-4 border-l-gray-600 bg-white border border-gray-200 ${getColorClasses()}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle className="text-lg text-gray-900">{title}</CardTitle>
          </div>
          {count && (
            <Badge variant="outline" className={getBadgeColor()}>
              {count}
            </Badge>
          )}
        </div>
        <CardDescription className="text-gray-600">
          {new Date(timestamp).toLocaleString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-700">{message}</p>
      </CardContent>
    </Card>
  );
};

export default AlertCard;
