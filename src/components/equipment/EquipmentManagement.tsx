
import React from 'react';
import EquipmentDashboard from './EquipmentDashboard';

interface EquipmentManagementProps {
  portalType?: 'business' | 'contractor';
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({ portalType = 'business' }) => {
  return (
    <div className="container mx-auto py-6">
      <EquipmentDashboard portalType={portalType} />
    </div>
  );
};

export default EquipmentManagement;
