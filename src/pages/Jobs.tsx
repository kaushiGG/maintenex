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
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const JobsPages: React.FC<JobsPagesProps> = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}: JobsPagesProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  console.log('JobsPages rendered with:', { userRole, userMode });
  
  const handleAuthSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <Routes>
      <Route 
        path="/assign" 
        element={
          <AssignJobPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
          />
        } 
      />
      <Route 
        path="/active" 
        element={
          <ActiveJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
          />
        } 
      />
      <Route
        path="/assigned"
        element={
          <AssignedJobsPage
            switchRole={switchRole}
            userRole={userRole}
            handleLogout={handleAuthSignOut}
            userMode={userMode}
          />
        }
      />
      <Route 
        path="/history" 
        element={
          <MyJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
            userMode={userMode}
          />
        } 
      />
      <Route 
        path="/report/:jobId" 
        element={
          <JobReportPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut} 
          />
        } 
      />
      <Route 
        path="/completed" 
        element={
          userRole === 'business' ? (
            <CompletedJobsPage />
          ) : (
            <ContractorCompletedJobsPage 
              switchRole={switchRole} 
              userRole={userRole} 
              handleLogout={handleAuthSignOut}
              userMode={userMode}
            />
          )
        } 
      />
      <Route 
        path="/*" 
        element={
          <MyJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
            userMode={userMode}
          />
        } 
      />
      <Route 
        path="/details/:jobId" 
        element={
          userRole === 'business' && userMode === 'provider' ? (
            <BusinessJobDetailsPageRedirect />
          ) : (
            <JobDetailsPage 
              switchRole={switchRole} 
              userRole={userRole} 
              handleLogout={handleAuthSignOut} 
            />
          )
        } 
      />
      <Route 
        path="/upcoming" 
        element={
          <MyJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
            userMode={userMode} 
          />
        } 
      />
      <Route 
        path="/in-progress" 
        element={
          <MyJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
            userMode={userMode} 
          />
        } 
      />
      <Route 
        path="/schedule" 
        element={
          <MyJobsPage 
            switchRole={switchRole} 
            userRole={userRole} 
            handleLogout={handleAuthSignOut}
            userMode={userMode} 
          />
        } 
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
