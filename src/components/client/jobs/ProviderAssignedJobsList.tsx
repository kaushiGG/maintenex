import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import JobsList from '@/components/contractor/jobs/components/JobsList';
import ProfileHeader from '@/components/contractor/jobs/components/ProfileHeader';
import { useBusinessJobActions } from './hooks/useBusinessJobActions';
import { fetchUserJobs } from '@/lib/supabase-functions';

const ProviderAssignedJobsList = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{firstName: string, lastName: string, email: string} | null>(null);
  const { user } = useAuth();
  const { handleViewDetails, handleStartJob, handleAcceptJob, handleViewReport, handleCompleteJob } = useBusinessJobActions();
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
          return;
        }
        
        if (data) {
          setProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfile();
  }, [user]);

  // Fetch jobs assigned to this business user
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        if (!user?.id) {
          console.log('No user found, cannot fetch jobs');
          return;
        }
        
        console.log('User details for job fetching:', { 
          id: user.id,
          email: user.email,
          metadata: user.user_metadata 
        });
        
        console.log('Fetching jobs assigned to business user in provider mode:', user.id);
        
        // Debug: Get the profile data directly to ensure we have the right data for matching
        const { data: profileData } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
          
        console.log('Profile data for jobs lookup:', profileData);
        
        // Just fetch all jobs, then filter them locally to have more control
        const { data: allJobs, error } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(name, address)
          `)
          .order('due_date', { ascending: true });
        
        if (error) {
          console.error('Error fetching jobs:', error);
          toast.error('Failed to load jobs');
          return;
        }
        
        console.log('All jobs fetched:', allJobs?.length || 0);
        
        // Prepare identifiers for local filtering
        const fullName = profileData ? 
          `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : '';
        const firstName = profileData?.first_name || '';
        const lastName = profileData?.last_name || '';
        const email = profileData?.email || '';
        const emailUsername = email.split('@')[0];
        
        // Filter jobs locally based on the assigned_to field
        const matchingJobs = allJobs?.filter(job => {
          const assignedTo = String(job.assigned_to || '').toLowerCase();
          
          return (
            assignedTo === user.id.toLowerCase() ||
            assignedTo === email.toLowerCase() ||
            assignedTo === fullName.toLowerCase() ||
            assignedTo.includes(firstName.toLowerCase()) ||
            assignedTo.includes(lastName.toLowerCase()) ||
            (emailUsername && assignedTo.includes(emailUsername.toLowerCase()))
          );
        }) || [];
        
        console.log(`Found ${matchingJobs.length} jobs matching user identifiers`);
        console.log('Matching jobs:', matchingJobs);
        
        if (matchingJobs.length > 0) {
          setJobs(matchingJobs);
        } else {
          console.log('No jobs found assigned to business user in provider mode');
          setJobs([]);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [user?.id, refreshKey]);
  
  const handleRefresh = () => {
    toast.info('Refreshing job data...');
    setRefreshKey(prev => prev + 1);
  };
  
  // Safely filter jobs (handling potentially undefined or non-array values)
  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
    if (!job || !job.status) return false; // Skip invalid job objects
    
    const jobStatus = (job.status || '').toLowerCase();
    const tabStatus = activeTab.toLowerCase();
    
    if (tabStatus === 'all') return true;
    // Handle special case for 'in-progress' tab
    if (tabStatus === 'in-progress' && (jobStatus === 'in progress' || jobStatus === 'in-progress')) return true;
    
    return jobStatus === tabStatus;
  }) : [];
  
  // Hide report button when in completed tab or all jobs tab
  const hideReportButton = activeTab === 'completed' || activeTab === 'all';
  
  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center">
        <ProfileHeader profile={profile} />
        
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
      <Tabs key={refreshKey} value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          <JobsList
            loading={loading}
            filteredJobs={filteredJobs}
            handleViewDetails={handleViewDetails}
            handleStartJob={handleStartJob}
            handleAcceptJob={handleAcceptJob}
            handleViewReport={handleViewReport}
            handleCompleteJob={handleCompleteJob}
            hideReportButton={hideReportButton}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProviderAssignedJobsList; 