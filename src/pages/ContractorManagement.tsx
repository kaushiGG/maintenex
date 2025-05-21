import React from 'react';
import ContractorsManagement from '@/components/contractors/ContractorsManagement';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const ContractorManagementPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Determine user role based on auth context
  const userRole = user?.user_metadata?.userType || 'contractor';

  // Redirect non-business users
  useEffect(() => {
    if (user && userRole !== 'business' && userRole !== 'contractor') {
      navigate('/unauthorized');
    }
  }, [user, userRole, navigate]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <ContractorsManagement />
  );
};

export default ContractorManagementPage;
