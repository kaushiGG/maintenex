
import React, { useState } from 'react';
import ClientDirectoryUI from '@/components/clients/ClientDirectoryUI';
import BusinessDashboard from '@/components/BusinessDashboard';
import { useNavigate } from 'react-router-dom';

const ClientDirectory = () => {
  const navigate = useNavigate();
  const [userMode] = useState<'management' | 'provider'>('provider');
  
  const handleLogout = () => {
    navigate('/login');
  };

  const switchMode = () => {
    // In a real app, this would toggle between management and provider mode
    // and update user preferences in the backend
    navigate('/dashboard', { state: { switchMode: userMode === 'management' ? 'provider' : 'management' } });
  };

  return (
    <BusinessDashboard 
      switchRole={() => {}} 
      userRole="business" 
      handleLogout={handleLogout}
      userMode={userMode}
      switchMode={switchMode}
    >
      <ClientDirectoryUI />
    </BusinessDashboard>
  );
};

export default ClientDirectory;
