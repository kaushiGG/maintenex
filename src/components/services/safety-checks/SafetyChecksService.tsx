import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, HomeIcon, InfoIcon, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

import SafetyChecksDashboard from './SafetyChecksDashboard';
import SafetyChecksHistory from './SafetyChecksHistory';
import SafetyChecksSchedule from './SafetyChecksSchedule';
import SafetyChecksReports from './SafetyChecksReports';

interface SafetyChecksServiceProps {
  switchRole?: () => void;
  userRole?: 'business' | 'contractor';
  handleLogout?: () => void;
}

const SafetyChecksService: React.FC<SafetyChecksServiceProps> = ({
  switchRole = () => {},
  userRole = 'business',
  handleLogout = () => {},
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSite, setSelectedSite] = useState<{ id: string; name: string; address: string; description?: string; } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobDetails, setJobDetails] = useState<any>(null);

  // Get parameters from URL
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');
  const siteIdFromUrl = queryParams.get('siteId');
  const siteNameFromUrl = queryParams.get('siteName');
  const siteAddressFromUrl = queryParams.get('siteAddress');
  const siteDescriptionFromUrl = queryParams.get('siteDescription');
  const jobIdFromUrl = queryParams.get('jobId');
  const jobDescriptionFromUrl = queryParams.get('jobDescription');

  // Handle tab changes
  useEffect(() => {
    if (tabFromUrl && ['dashboard', 'history', 'schedule', 'reports'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  // Handle site data
  useEffect(() => {
    if (siteIdFromUrl) {
      setSelectedSite({
        id: siteIdFromUrl,
        name: siteNameFromUrl || 'Unknown Site',
        address: siteAddressFromUrl || 'No address provided',
        description: siteDescriptionFromUrl || undefined
      });

      // If we have a site ID, try to load additional site data
      const fetchSiteDetails = async () => {
        try {
          if (siteIdFromUrl && siteIdFromUrl !== 'unknown') {
            const { data, error } = await supabase
              .from('business_sites')
              .select('*')
              .eq('id', siteIdFromUrl)
              .single();

            if (error) {
              console.error('Error fetching site details:', error);
            } else if (data) {
              setSelectedSite({
                id: data.id,
                name: data.name,
                address: data.address || 'No address provided',
                description: data.description
              });
            }
          }
          setIsLoading(false);
        } catch (error) {
          console.error('Error in fetchSiteDetails:', error);
          setIsLoading(false);
        }
      };

      fetchSiteDetails();
    } else {
      // Default data for demo purposes
      setSelectedSite({
        id: 'site-001',
        name: 'Main Office Complex',
        address: '123 Business Ave, Enterprise Park, 3000'
      });
      setIsLoading(false);
    }
  }, [siteIdFromUrl, siteNameFromUrl, siteAddressFromUrl, siteDescriptionFromUrl]);

  // Handle job data
  useEffect(() => {
    if (jobIdFromUrl) {
      setJobId(jobIdFromUrl);
      
      // Fetch job details
      const fetchJobDetails = async () => {
        try {
          const { data, error } = await supabase
            .from('jobs')
            .select(`
              *,
              business_sites:site_id (
                id,
                name,
                address,
                description
              )
            `)
            .eq('id', jobIdFromUrl)
            .single();

          if (error) {
            console.error('Error fetching job details:', error);
            toast.error('Failed to load job details.');
          } else if (data) {
            setJobDetails(data);
            // If we didn't already set site info, set it from job details
            if (!selectedSite && data.business_sites) {
              setSelectedSite({
                id: data.business_sites.id,
                name: data.business_sites.name,
                address: data.business_sites.address || 'No address provided',
                description: data.business_sites.description
              });
            }
          }
        } catch (error) {
          console.error('Error in fetchJobDetails:', error);
        }
      };

      fetchJobDetails();
    }
  }, [jobIdFromUrl, selectedSite]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('tab', value);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const handleBackToServices = () => {
    if (jobId) {
      // If we came from a job, go back to the jobs list
      navigate('/jobs/assigned');
    } else {
      // Otherwise go to the service landing page
      navigate('/services/landing/safety-checks');
    }
  };

  const firstName = user?.user_metadata?.firstName || '';
  const lastName = user?.user_metadata?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'User';
  const email = user?.email || 'user@example.com';

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar 
          handleLogout={handleLogout}
          userMode="provider"
          portalType={userRole}
        />
        <div className="flex-1">
          <DashboardHeader 
            userRole={userRole}
            handleLogout={handleLogout}
            userData={{
              fullName,
              email,
              userType: userRole
            }}
            switchRole={switchRole ? switchRole : null}
          />
          <div className="p-8 flex flex-col items-center justify-center h-[80vh]">
            <p>Loading safety checks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedSite) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar 
          handleLogout={handleLogout}
          userMode="provider"
          portalType={userRole}
        />
        <div className="flex-1">
          <DashboardHeader 
            userRole={userRole}
            handleLogout={handleLogout}
            userData={{
              fullName,
              email,
              userType: userRole
            }}
            switchRole={switchRole ? switchRole : null}
          />
          <div className="p-8 flex flex-col items-center justify-center h-[80vh]">
            <Card className="w-full max-w-md">
              <CardContent className="p-6 text-center">
                <InfoIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                <h2 className="text-xl font-bold mb-2">No Site Selected</h2>
                <p className="text-gray-500 mb-4">Please select a site to manage safety checks.</p>
                <Button onClick={handleBackToServices}>
                  Select Site
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar 
        handleLogout={handleLogout}
        userMode="provider"
        portalType={userRole}
      />
      <div className="flex-1">
        <DashboardHeader 
          userRole={userRole}
          handleLogout={handleLogout}
          userData={{
            fullName,
            email,
            userType: userRole
          }}
          switchRole={switchRole ? switchRole : null}
        />
        <div className="p-6">
          {/* Back navigation */}
          <Button
            variant="ghost"
            className="mb-4 text-gray-500 hover:text-gray-700 p-0"
            onClick={handleBackToServices}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to {jobId ? 'Assigned Jobs' : 'Services'}
          </Button>

          {/* Job info banner (if applicable) */}
          {jobId && jobDetails && (
            <Card className="mb-6 bg-blue-50 border-blue-200">
              <CardContent className="flex items-start gap-3 p-4">
                <Briefcase className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium">Job: {jobDetails.title || 'Safety Check Job'}</h3>
                  <p className="text-sm text-gray-600">{jobDetails.description || jobDescriptionFromUrl || 'No description provided'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Header with site info */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <HomeIcon className="h-5 w-5 text-blue-500" />
              <h2 className="text-xl font-bold">{selectedSite.name}</h2>
            </div>
            <p className="text-gray-500 text-sm">{selectedSite.address}</p>
            {selectedSite.description && (
              <p className="text-gray-500 text-sm mt-1">{selectedSite.description}</p>
            )}
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="history">Audit History</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <div className="bg-white rounded-lg p-6">
              <TabsContent value="dashboard">
                <SafetyChecksDashboard siteId={selectedSite.id} />
              </TabsContent>
              <TabsContent value="history">
                <SafetyChecksHistory siteId={selectedSite.id} />
              </TabsContent>
              <TabsContent value="schedule">
                <SafetyChecksSchedule siteId={selectedSite.id} />
              </TabsContent>
              <TabsContent value="reports">
                <SafetyChecksReports siteId={selectedSite.id} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SafetyChecksService; 