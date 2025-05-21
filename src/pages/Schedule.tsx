import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, CheckSquare, AlertTriangle } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import ScheduleCalendarView from '@/components/contractor/schedule/ScheduleCalendarView';
import ScheduleListView from '@/components/contractor/schedule/ScheduleListView';
import UpcomingJobs from '@/components/contractor/schedule/UpcomingJobs';
import ScheduleConflicts from '@/components/contractor/schedule/ScheduleConflicts';
interface ScheduleProps {
  switchRole?: () => void;
  userRole?: 'admin' | 'contractor';
  handleLogout: () => void;
}
const Schedule = ({
  switchRole,
  userRole = 'contractor',
  handleLogout
}: ScheduleProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('calendar');

  // Set the active tab based on the current route
  useEffect(() => {
    if (location.pathname.includes('/schedule/list')) {
      setActiveTab('list');
    } else if (location.pathname.includes('/schedule/upcoming')) {
      setActiveTab('upcoming');
    } else if (location.pathname.includes('/schedule/conflicts')) {
      setActiveTab('conflicts');
    } else {
      setActiveTab('calendar');
    }
  }, [location.pathname]);
  const handleTabChange = (value: string) => {
    switch (value) {
      case 'calendar':
        navigate('/schedule');
        break;
      case 'list':
        navigate('/schedule/list');
        break;
      case 'upcoming':
        navigate('/schedule/upcoming');
        break;
      case 'conflicts':
        navigate('/schedule/conflicts');
        break;
    }
  };
  return <div className="flex min-h-screen">
      <DashboardSidebar handleLogout={handleLogout} portalType="contractor" />
      
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-950">My Schedule</h1>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full mb-6">
          <TabsList className="grid grid-cols-4 w-full max-w-2xl">
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>List View</span>
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span>Upcoming</span>
            </TabsTrigger>
            <TabsTrigger value="conflicts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Conflicts</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Routes>
          <Route path="/" element={<ScheduleCalendarView />} />
          <Route path="/list" element={<ScheduleListView />} />
          <Route path="/upcoming" element={<UpcomingJobs />} />
          <Route path="/conflicts" element={<ScheduleConflicts />} />
        </Routes>
      </div>
    </div>;
};
export default Schedule;