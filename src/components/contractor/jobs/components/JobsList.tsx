import React from 'react';
import JobCard from './JobCard';
import { Job } from '@/types/job';

export interface JobsListProps {
  jobs?: Job[];
  onSelect?: (jobId: string) => void;
  selectedJobId?: string;
  loading: boolean;
  filteredJobs: any[] | undefined;
  handleViewDetails: (jobId: string) => void;
  handleStartJob: (job: any) => void;
  handleAcceptJob?: (job: any) => void;
  handleViewReport?: (job: any) => void;
  handleCompleteJob?: (job: any) => void;
  hideReportButton?: boolean;
}

const JobsList = ({ 
  loading, 
  filteredJobs = [],
  handleViewDetails, 
  handleStartJob,
  handleAcceptJob,
  handleViewReport,
  handleCompleteJob,
  hideReportButton = false
}: JobsListProps) => {
  const jobsToRender = Array.isArray(filteredJobs) ? filteredJobs : [];
  
  if (loading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Loading jobs...</p>
      </div>
    );
  }
  
  if (jobsToRender.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No jobs found for the selected criteria.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {jobsToRender.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          handleViewDetails={handleViewDetails}
          handleStartJob={handleStartJob}
          handleAcceptJob={handleAcceptJob}
          handleViewReport={handleViewReport}
          handleCompleteJob={handleCompleteJob}
          hideReportButton={hideReportButton}
        />
      ))}
    </div>
  );
};

export default JobsList;
