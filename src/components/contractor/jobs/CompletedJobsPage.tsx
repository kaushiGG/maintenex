import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import CompletedJobsTab from './components/CompletedJobsTab';

interface CompletedJobsPageProps {
  switchRole?: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const CompletedJobsPage = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}: CompletedJobsPageProps) => {
  const navigate = useNavigate();
  const portalType = 'contractor';
  
  const handleExportReports = () => {
    // TODO: Implement export functionality
    console.log('Export reports functionality to be implemented');
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Completed Jobs"
        portalType={portalType}
        userMode={userMode}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType={portalType}
          userMode={userMode}
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-pretance-purple sm:text-2xl sm:tracking-tight">
                Completed Jobs
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your completed job history
              </p>
            </div>
          </div>
          
          <CompletedJobsTab />
        </main>
      </div>
    </div>
  );
};

export default CompletedJobsPage; 