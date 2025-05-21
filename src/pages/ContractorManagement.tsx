import React from 'react';
import ContractorsManagement from '@/components/contractors/ContractorsManagement';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ContractorManagementPage = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Determine user role based on auth context
  const userRole = user?.user_metadata?.userType || 'contractor';

  // Redirect non-business users
  useEffect(() => {
    if (user && userRole !== 'business' && userRole !== 'contractor') {
      router.push('/unauthorized');
    }
  }, [user, userRole, router]);

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <ContractorsManagement />
  );
};

export default ContractorManagementPage;
