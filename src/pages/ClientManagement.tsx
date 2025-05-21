
import React from 'react';
import ClientManagementUI from '@/components/clients/ClientManagementUI';
import BusinessDashboard from '@/components/BusinessDashboard';
import { useNavigate } from 'react-router-dom';

const ClientManagement = () => {
  const navigate = useNavigate();
  const [userMode] = React.useState<'management' | 'provider'>('management');
  
  const handleLogout = () => {
    navigate('/login');
  };

  const switchMode = () => {
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
      <ClientManagementUI />
    </BusinessDashboard>
  );
};

export default ClientManagement;
