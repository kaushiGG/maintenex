
import React from 'react';
import MaintenanceChart from '@/components/dashboard/MaintenanceChart';
import AlertsList from '@/components/dashboard/AlertsList';

const MaintenanceAndAlerts = () => {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3 mb-3">
      <div className="lg:col-span-2 overflow-x-auto">
        <MaintenanceChart />
      </div>
      <AlertsList />
    </div>
  );
};

export default MaintenanceAndAlerts;
