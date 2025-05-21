
import React from 'react';
import BusinessDashboardContent from './client/dashboard/BusinessDashboardContent';
import { useNavigate } from 'react-router-dom';
import { UserMode } from './dashboard/sidebar/hooks/useSidebarLinks';
import { useAuth } from '@/context/AuthContext';

interface BusinessDashboardProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
  switchMode?: () => void;
  children?: React.ReactNode;
}

const BusinessDashboard = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'management',
  switchMode,
  children
}: BusinessDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleEquipmentSetupClick = () => {
    navigate('/equipment/dashboard');
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <BusinessDashboardContent 
      switchRole={null} // Remove the ability to switch to contractor view
      userRole={userRole} 
      handleLogout={handleLogout} 
      onEquipmentSetupClick={handleEquipmentSetupClick}
      onBackToDashboard={handleBackToDashboard}
      userMode={userMode}
      switchMode={switchMode}
      userData={user}
    >
      {children}
    </BusinessDashboardContent>
  );
};

export default BusinessDashboard;
