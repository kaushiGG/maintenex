
import React from 'react';
import ClientDashboardContent from './client/dashboard/ClientDashboardContent';
import { useNavigate } from 'react-router-dom';
import { UserMode } from './dashboard/sidebar/hooks/useSidebarLinks';

interface ClientDashboardProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
  switchMode?: () => void;
}

const ClientDashboard = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'management',
  switchMode
}: ClientDashboardProps) => {
  const navigate = useNavigate();

  const handleEquipmentSetupClick = () => {
    navigate('/equipment/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <ClientDashboardContent 
      switchRole={switchRole} 
      userRole={userRole} 
      handleLogout={handleLogout} 
      onEquipmentSetupClick={handleEquipmentSetupClick}
      onBackToDashboard={handleBackToDashboard}
      userMode={userMode}
      switchMode={switchMode}
    />
  );
};

export default ClientDashboard;
