import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';
import EnhancedFloorPlanManager from '@/components/sites/floorplans/EnhancedFloorPlanManager';

const EnhancedFloorPlans: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <BusinessDashboardContent
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <EnhancedFloorPlanManager />
    </BusinessDashboardContent>
  );
};

export default EnhancedFloorPlans; 