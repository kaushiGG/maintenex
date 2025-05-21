import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import SitesManagement from '@/components/sites/SitesManagement';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';

const Sites = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      if (!user) {
        navigate('/login');
      } else {
        try {
          // You might want to fetch some data here to ensure the user is fully authenticated
          // For example, check if the user has a valid session on the server
          // If there's an error, it will be caught and the user will be redirected
          // await fetch('/api/check-auth'); // Replace with your actual API endpoint
        } catch (error) {
          console.error('Authentication check failed:', error);
          navigate('/login');
          return;
        }

        const userRole = (user?.user_metadata?.userType || 'contractor') as 'business' | 'contractor';
        if (userRole === 'contractor') {
          navigate('/client/dashboard');
        } else {
          // Set loading to false to render the page for business users
          setLoading(false);
        }
      }
      setLoading(false);
    };

    checkUser();
  }, [user, navigate]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <BusinessDashboardContent
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <div className="container mx-auto py-6">
        <SitesManagement portalType="business" />
      </div>
    </BusinessDashboardContent>
  );
};

export default Sites;
