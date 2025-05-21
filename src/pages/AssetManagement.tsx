
import React from 'react';
import AssetManagementDashboard from '@/components/assets/AssetManagementDashboard';
import { useLocation } from 'react-router-dom';

const AssetManagement = () => {
  const location = useLocation();
  // This would typically come from user context/state in a real application
  const portalType = location.pathname.includes('/contractor') ? 'contractor' as const : 'business' as const;

  return (
    <AssetManagementDashboard portalType={portalType} />
  );
};

export default AssetManagement;
