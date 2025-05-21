import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useJobsData } from './hooks/useJobsData';
import { useJobActions } from './hooks/useJobActions';
import ProfileHeader from './components/ProfileHeader';
import JobsList from './components/JobsList';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const AssignedJobsList = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [refreshKey, setRefreshKey] = useState(0); // Used to trigger refresh
  const { jobs, loading, profile } = useJobsData();
  const { handleViewDetails, handleStartJob, handleAcceptJob, handleViewReport, handleCompleteJob } = useJobActions();
  
  // Add safe console logging
  useEffect(() => {
    console.log('Current jobs in AssignedJobsList:', jobs || []);
    console.log('Active tab:', activeTab);
  }, [jobs, activeTab]);
  
  const handleRefresh = () => {
    toast.info('Refreshing job data...');
    setRefreshKey(prev => prev + 1);
  };
  
  // Safely filter jobs (handling potentially undefined or non-array values)
  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
    if (!job || !job.status) return false; // Skip invalid job objects
    
    const jobStatus = (job.status || '').toLowerCase();
    const tabStatus = activeTab.toLowerCase();
    
    console.log(`Comparing job status: "${jobStatus}" with tab: "${tabStatus}"`);
    
    if (tabStatus === 'all') return true;
    // Handle special case for 'in-progress' tab
    if (tabStatus === 'in-progress' && (jobStatus === 'in progress' || jobStatus === 'in-progress')) return true;
    
    return jobStatus === tabStatus;
  }) : [];
  
  console.log('Filtered jobs:', filteredJobs);
  
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

export default AssignedJobsList;
