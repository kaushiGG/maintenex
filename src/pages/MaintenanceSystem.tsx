
import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useNavigate, useLocation, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from '@/components/maintenance/UserManagement';
import ContractorAccessControl from '@/components/maintenance/ContractorAccessControl';
import DataBackupRestore from '@/components/maintenance/DataBackupRestore';
import SystemLogs from '@/components/maintenance/SystemLogs';
import ConfigurationSettings from '@/components/maintenance/ConfigurationSettings';
import SecurityControls from '@/components/maintenance/SecurityControls';

const MaintenanceSystem = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userRole, setUserRole] = useState<'business' | 'contractor'>('business');
  
  useEffect(() => {
    // Get user role from localStorage or set default
    const storedRole = localStorage.getItem('userRole') as 'business' | 'contractor' | null;
    if (storedRole) {
      setUserRole(storedRole);
    }
  }, []);
  
  const handleLogout = () => {
    navigate('/login');
  };
  
  const switchRole = () => {
    const newRole = userRole === 'business' ? 'contractor' : 'business';
    setUserRole(newRole);
    localStorage.setItem('userRole', newRole);
  };

  // Get the title based on the current path
  const getTitle = () => {
    const path = location.pathname;
    
    if (path.includes('/maintenance/users')) {
      return "User Management";
    } else if (path.includes('/maintenance/contractor-access')) {
      return "Contractor Access Control";
    } else if (path.includes('/maintenance/data-backup')) {
      return "Data Backup & Restore";
    } else if (path.includes('/maintenance/logs')) {
      return "System Logs & Activity Tracking";
    } else if (path.includes('/maintenance/configuration')) {
      return "Configuration & Settings";
    } else if (path.includes('/maintenance/security')) {
      return "Security & Privacy Controls";
    } else {
      return "Maintenance System";
    }
  };

  return (
    <div className="w-full">
      <DashboardHeader 
        title={getTitle()} 
        handleLogout={handleLogout}
        userRole={userRole}
        switchRole={switchRole}
        portalType="business"
      />
      <div className="flex">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="business"
        />
        <div className="flex-1 bg-gray-50 min-h-[calc(100vh-64px)]">
          <Routes>
            <Route path="/" element={<Navigate to="/maintenance/users" replace />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/contractor-access" element={<ContractorAccessControl />} />
            <Route path="/data-backup" element={<DataBackupRestore />} />
            <Route path="/logs" element={<SystemLogs />} />
            <Route path="/configuration" element={<ConfigurationSettings />} />
            <Route path="/security" element={<SecurityControls />} />
            <Route path="*" element={<Navigate to="/maintenance/users" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSystem;
