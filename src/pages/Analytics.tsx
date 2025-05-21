import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Card } from '@/components/ui/card';
import AnalyticsTab from '@/components/reporting/tabs/AnalyticsTab';

interface AnalyticsProps {
  switchRole?: () => void;
  userRole?: 'business' | 'contractor';
  handleLogout?: () => void;
}

const Analytics: React.FC<AnalyticsProps> = ({ 
  switchRole = () => {}, 
  userRole = 'business', 
  handleLogout = () => {} 
}) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar 
        handleLogout={handleLogout} 
        portalType={userRole} 
        userMode="management"
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          switchRole={switchRole} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          title="Analytics" 
          portalType={userRole}
        />
        
        <main className="flex-1 overflow-y-auto p-4">
          <Card className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-black">Analytics Dashboard</h1>
            <AnalyticsTab />
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Analytics;
