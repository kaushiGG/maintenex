import React from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessDashboard from '@/components/BusinessDashboard';
import { useAuth } from '@/context/AuthContext';
import ServiceCompletionTab from '@/components/reporting/tabs/ServiceCompletionTab';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const CompletedJobReports = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <BusinessDashboard 
      switchRole={() => {}} 
      userRole="business" 
      handleLogout={handleLogout}
      userMode="management"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Completed Job Reports</CardTitle>
            <CardDescription>
              View and manage detailed reports for all completed service jobs
            </CardDescription>
          </CardHeader>
        </Card>
        
        <ServiceCompletionTab />
      </div>
    </BusinessDashboard>
  );
};

export default CompletedJobReports; 