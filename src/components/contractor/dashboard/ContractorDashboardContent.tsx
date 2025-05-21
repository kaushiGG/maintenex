import React, { ReactNode } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import {
  Calendar,
  CheckCircle,
  FileText,
  User,
  MapPin,
  ListTodo,
} from 'lucide-react';
import UpcomingJobs from './UpcomingJobs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import QuickActionCard from './QuickActionCard';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { usePendingJobsCount } from './hooks/usePendingJobsCount';
import { Link } from 'react-router-dom';

interface ContractorDashboardContentProps {
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
  userData?: SupabaseUser | null;
  children?: ReactNode;
}

const ContractorDashboardContent = ({ 
  userRole, 
  handleLogout,
  showBackButton = false,
  backTo = "/dashboard",
  backText = "Dashboard",
  userData,
  children
}: ContractorDashboardContentProps) => {
  const navigate = useNavigate();
  const { pendingJobsCount, loading: jobsLoading } = usePendingJobsCount();

  // Get user info from metadata
  const firstName = userData?.user_metadata?.firstName || '';
  const lastName = userData?.user_metadata?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Contractor User';
  const email = userData?.email || 'contractor@example.com';

  // Set contractor role in local storage to ensure staying in contractor mode
  React.useEffect(() => {
    localStorage.setItem('userRole', 'contractor');
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={null} 
        userRole="contractor" 
        handleLogout={handleLogout} 
        title="Forgemate Contractor Portal"
        portalType="contractor"
        showBackButton={showBackButton}
        backTo={backTo}
        backText={backText}
        userData={{
          fullName,
          email,
          userType: 'contractor'
        }}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="contractor"
        />
        
        <main className="flex-1 p-4 bg-gray-50 overflow-x-hidden">
          {children || (
            <>
              <div className="bg-black rounded-xl p-6 mb-6 text-white shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold mb-2 text-[#FF6B00]">Forgemate Dashboard</h1>
                    <p className="text-white">Manage your jobs, schedule, and services all in one place.</p>
                  </div>
                </div>
              </div>
              
              <div className="md:flex md:items-center md:justify-between mb-6">
                <div className="flex-1 min-w-0 mb-4 md:mb-0">
                  <h2 className="text-xl font-bold leading-7 text-[#FF6B00] sm:tracking-tight">
                    Your Services & Jobs
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your assigned services and track your upcoming jobs
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => navigate('/jobs/assigned')}
                    variant="outline"
                    className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
                  >
                    All Jobs
                  </Button>
                </div>
              </div>
              
              {/* Grid of quick action cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <QuickActionCard
                  icon={Calendar}
                  title="Assigned Jobs"
                  description="View assigned services"
                  onClick={() => navigate('/jobs/assigned')}
                  badge={pendingJobsCount > 0 ? { 
                    text: `${pendingJobsCount} New`, 
                    variant: "default", 
                    blink: true 
                  } : undefined}
                  iconBgColor="bg-[#FF6B00]/10"
                  iconColor="text-[#FF6B00]"
                />
                
                <QuickActionCard
                  icon={CheckCircle}
                  title="Completed Jobs"
                  description="Review past work"
                  onClick={() => navigate('/jobs/completed')}
                  iconBgColor="bg-[#FF6B00]/10" 
                  iconColor="text-[#FF6B00]"
                />
                
                <QuickActionCard
                  icon={FileText}
                  title="Documentation"
                  description="Access service forms"
                  onClick={() => navigate('/service-form-access')}
                  iconBgColor="bg-[#FF6B00]/10"
                  iconColor="text-[#FF6B00]"
                />
                
                <QuickActionCard
                  icon={User}
                  title="My Profile"
                  description="Manage your details"
                  onClick={() => navigate('/profile')}
                  iconBgColor="bg-[#FF6B00]/10"
                  iconColor="text-[#FF6B00]"
                />
              </div>
              
              {/* Upcoming jobs section */}
              <div className="my-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Upcoming Jobs</h2>
                  <Button variant="link" className="text-[#FF6B00] p-0">View all</Button>
                </div>
                <div className="space-y-4">
                  <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">Office Cleaning</h3>
                        <p className="text-sm text-gray-500">123 Business St, Sydney</p>
                      </div>
                      <Badge className="bg-[#FF6B00] text-white">Tomorrow</Badge>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm">
                        <span className="text-gray-500">Time:</span>
                        <span className="ml-1 font-medium">9:00 AM - 11:00 AM</span>
                      </div>
                      <Button variant="outline" size="sm" className="border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10">View Details</Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Service areas section */}
              <div className="mt-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Your Service Areas</h2>
                <div className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center mb-4">
                    <MapPin className="h-5 w-5 text-[#FF6B00] mr-2" />
                    <span className="font-medium">Primary Locations</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                    <Badge variant="outline" className="px-3 py-1 text-sm justify-center border-[#FF6B00] text-[#FF6B00]">Sydney CBD</Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm justify-center border-[#FF6B00] text-[#FF6B00]">North Sydney</Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm justify-center border-[#FF6B00] text-[#FF6B00]">Parramatta</Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm justify-center border-[#FF6B00] text-[#FF6B00]">Eastern Suburbs</Badge>
                    <Badge variant="outline" className="px-3 py-1 text-sm justify-center border-[#FF6B00] text-[#FF6B00]">Inner West</Badge>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ContractorDashboardContent;

