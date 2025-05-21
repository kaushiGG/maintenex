
import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import MyJobsPage from '@/components/contractor/jobs/MyJobsPage';
import JobDetailsPage from '@/components/contractor/jobs/JobDetailsPage';
import AssignJobPage from '@/components/client/jobs/AssignJobPage';
import ActiveJobsPage from '@/components/client/jobs/ActiveJobsPage';
import CompletedJobsPage from '@/components/client/jobs/CompletedJobsPage';
import AssignedJobsPage from '@/components/contractor/jobs/AssignedJobsPage';
import JobReportPage from '@/components/contractor/jobs/JobReportPage';
import ContractorCompletedJobsPage from '@/components/contractor/jobs/CompletedJobsPage';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessJobDetailsPage from '@/components/client/jobs/BusinessJobDetailsPage';

interface JobsPagesProps {
  switchRole?: () => void;
  userRole: 'business' | 'contractor';
  handleLogout?: () => void;
  userMode?: UserMode;
}

const JobsPages: React.FC<JobsPagesProps> = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  console.log('JobsPages rendered with:', { userRole, userMode });
  
  const handleAuthSignOut = async () => {
    if (handleLogout) {
      handleLogout();
    } else {
      await signOut();
      navigate('/login');
    }
  };

  const safeProps = {
    switchRole: switchRole || (() => {}),
    userRole,
    handleLogout: handleAuthSignOut,
    userMode
  };
  
  return (
    <Routes>
      <Route 
        path="/assign" 
        element={<AssignJobPage {...safeProps} />} 
      />
      <Route 
        path="/active" 
        element={<ActiveJobsPage {...safeProps} />} 
      />
      <Route
        path="/assigned"
        element={<AssignedJobsPage {...safeProps} />}
      />
      <Route 
        path="/history" 
        element={<MyJobsPage {...safeProps} />} 
      />
      <Route 
        path="/report/:jobId" 
        element={<JobReportPage {...safeProps} />} 
      />
      <Route 
        path="/completed" 
        element={
          userRole === 'business' ? (
            <CompletedJobsPage {...safeProps} />
          ) : (
            <ContractorCompletedJobsPage {...safeProps} />
          )
        } 
      />
      <Route 
        path="/*" 
        element={<MyJobsPage {...safeProps} />} 
      />
      <Route 
        path="/details/:jobId" 
        element={
          userRole === 'business' && userMode === 'provider' ? (
            <BusinessJobDetailsPageRedirect />
          ) : (
            <JobDetailsPage {...safeProps} /> 
          )
        } 
      />
      <Route 
        path="/upcoming" 
        element={<MyJobsPage {...safeProps} />} 
      />
      <Route 
        path="/in-progress" 
        element={<MyJobsPage {...safeProps} />} 
      />
      <Route 
        path="/schedule" 
        element={<MyJobsPage {...safeProps} />} 
      />
    </Routes>
  );
};

const BusinessJobDetailsPageRedirect = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  
  React.useEffect(() => {
    if (jobId) {
      console.log('Redirecting to business provider job details page');
      navigate(`/business/provider/jobs/${jobId}`, { replace: true });
    }
  }, [jobId, navigate]);
  
  return <div>Redirecting to business provider job details...</div>;
};

export default JobsPages;
