import React from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessDashboard from '@/components/BusinessDashboard';
import UserApproval from '@/components/settings/UserApproval';
import { useAuth } from '@/context/AuthContext';

const UserApprovalPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <BusinessDashboard 
      switchRole={() => {}} 
      userRole="business" 
      handleLogout={handleLogout}
      userMode="management"
    >
      <div className="bg-black min-h-screen">
        <UserApproval />
      </div>
    </BusinessDashboard>
  );
};

export default UserApprovalPage;
