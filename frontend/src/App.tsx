import { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import QuestionAnswerDashboard from './components/dashboard/QuestionAnswerDashboard';
import CustomerSuccessDashboard from './components/dashboard/CustomerSuccessDashboard';
import SpecificQueries from './components/dashboard/SpecificQueries';
import EmployeeQueries from './components/dashboard/EmployeeQueries';
import SystemOverview from './components/dashboard/SystemOverview';
import CustomerTopics from './components/dashboard/CustomerTopics';

function App() {
  const [activeView, setActiveView] = useState<string>('questions');

  const renderActiveView = () => {
    switch (activeView) {
      case 'questions':
        return <QuestionAnswerDashboard />;
      case 'specific':
        return <SpecificQueries />;
      case 'employee':
        return <EmployeeQueries />;
      case 'detailed':
        return <CustomerSuccessDashboard />;
      case 'topics':
        return <CustomerTopics />;
      case 'analytics':
        return <div className="p-6">Analytics Dashboard - Coming Soon</div>;
      case 'overview':
      default:
        return <SystemOverview />;
    }
  };

  return (
    <AuthProvider>
      <ProtectedRoute>
        <AppLayout activeView={activeView} onViewChange={setActiveView}>
          {renderActiveView()}
        </AppLayout>
      </ProtectedRoute>
    </AuthProvider>
  );
}

export default App;
