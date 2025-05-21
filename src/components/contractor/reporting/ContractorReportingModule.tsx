import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart2, Clock, CheckCircle } from 'lucide-react';
import PerformanceReportTab from './tabs/PerformanceReportTab';
import TimesheetReportTab from './tabs/TimesheetReportTab';
import CompletedWorkReportTab from './tabs/CompletedWorkReportTab';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

interface ContractorReportingModuleProps {
  userRole: 'contractor';
  handleLogout: () => void;
}

const ContractorReportingModule: React.FC<ContractorReportingModuleProps> = ({ 
  userRole, 
  handleLogout 
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('performance');
  
  // Ensure contractor role is set
  useEffect(() => {
    localStorage.setItem('userRole', 'contractor');
  }, []);
  
  // Determine active tab based on URL
  useEffect(() => {
    if (location.pathname.includes('/reports/timesheet')) {
      setActiveTab('timesheet');
    } else if (location.pathname.includes('/reports/completed')) {
      setActiveTab('completed');
    } else {
      setActiveTab('performance');
    }
  }, [location]);
  
  // Handle tab change with URL updates
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    switch (value) {
      case 'timesheet':
        navigate('/reports/timesheet');
        break;
      case 'completed':
        navigate('/reports/completed');
        break;
      default:
        navigate('/reports/performance');
        break;
    }
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={null} 
        userRole="contractor" 
        handleLogout={handleLogout} 
        title="Contractor Reports"
        portalType="contractor"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="contractor"
        />
        
        <main className="flex-1 p-4 bg-gray-50 overflow-x-hidden">
          <div className="bg-white rounded-lg shadow p-6 border border-orange-200">
            <h1 className="text-2xl font-bold mb-6 text-black">Contractor Reports</h1>
            
            <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
              <TabsList className="mb-6 flex flex-wrap border border-orange-200 bg-orange-50">
                <TabsTrigger 
                  value="performance" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  <BarChart2 className="h-4 w-4" />
                  My Performance
                </TabsTrigger>
                <TabsTrigger 
                  value="timesheet" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  <Clock className="h-4 w-4" />
                  Timesheet
                </TabsTrigger>
                <TabsTrigger 
                  value="completed" 
                  className="flex items-center gap-2 data-[state=active]:bg-orange-600 data-[state=active]:text-white"
                >
                  <CheckCircle className="h-4 w-4" />
                  Completed Work
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="performance">
                <PerformanceReportTab />
              </TabsContent>
              
              <TabsContent value="timesheet">
                <TimesheetReportTab />
              </TabsContent>
              
              <TabsContent value="completed">
                <CompletedWorkReportTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContractorReportingModule;
