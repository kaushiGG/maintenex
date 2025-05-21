
import React from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Calendar, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import AssignedJobsList from './AssignedJobsList';

interface AssignedJobsPageProps {
  switchRole?: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const AssignedJobsPage = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}: AssignedJobsPageProps) => {
  const navigate = useNavigate();
  const portalType = 'contractor';
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Assigned Jobs"
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
                Assigned Jobs
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View all jobs assigned to you
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <Button variant="outline" className="text-pretance-purple border-pretance-light">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
              
              <Button variant="outline" onClick={() => navigate('/schedule')} className="text-pretance-purple border-pretance-light">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </Button>
            </div>
          </div>
          
          <AssignedJobsList />
        </main>
      </div>
    </div>
  );
};

export default AssignedJobsPage;
