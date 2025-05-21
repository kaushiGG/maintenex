
import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { ApprovalCheck } from '@/components/auth/ApprovalCheck';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading: authLoading, userRole } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug the profile and current path
  useEffect(() => {
    if (profile) {
      console.log("Current profile:", profile);
      console.log("Current path:", location.pathname);
      console.log("Current user role:", userRole);
    }
  }, [profile, location.pathname, userRole]);

  // Check for approved contractor via localStorage
  const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
  
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F3F0FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forgemate-purple"></div>
      </div>
    );
  }

  // Allow both authenticated users and approved contractors
  if (!user && !isApprovedContractor) {
    console.log("No authenticated user or approved contractor, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // For contractors from normal auth flow, check if they're approved
  if (!isApprovedContractor && profile?.user_type === 'contractor' && profile?.is_approved === false) {
    console.log('Contractor not approved, showing approval pending message');
    
    return <div className="min-h-screen flex flex-col justify-center items-center bg-[#F3F0FF]">
      <h1 className="text-2xl font-bold text-forgemate-purple mb-4">Account Pending Approval</h1>
      <p className="text-gray-600">Your contractor account is pending approval by a business user.</p>
      <p className="text-gray-600 mt-2">You'll be able to access the contractor portal once your account has been approved.</p>
      <button 
        onClick={() => navigate('/login')} 
        className="mt-6 px-4 py-2 bg-forgemate-purple text-white rounded-md hover:bg-forgemate-dark transition-colors"
      >
        Back to Login
      </button>
    </div>;
  }

  // Set default paths for redirection
  const businessRoutes = ['/dashboard', '/sites', '/clients', '/settings/user-approval', '/reports/completed-jobs'];
  const contractorRoutes = ['/contractor-dashboard'];
  
  // Determine if user is a contractor (either by localStorage or profile)
  const isContractor = isApprovedContractor || (profile?.user_type === 'contractor' && profile?.is_approved === true);
  const isBusiness = profile?.user_type === 'business' || userRole === 'business';

  // Redirect contractors trying to access business routes
  if (isContractor && !isBusiness) {
    if (businessRoutes.some(path => location.pathname.startsWith(path))) {
      console.log('Contractor trying to access business route, redirecting to contractor dashboard');
      return <Navigate to="/contractor-dashboard" replace />;
    }
  }

  // Redirect business users trying to access contractor routes
  if (isBusiness && !isContractor) {
    if (contractorRoutes.some(path => location.pathname.startsWith(path))) {
      console.log('Business user trying to access contractor route, redirecting to business dashboard');
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
