import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import OperationsOverview from './OperationsOverview';
import EquipmentSetup from '@/components/equipment/EquipmentSetup';
import { useNavigate } from 'react-router-dom';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import { Badge } from '@/components/ui/badge';

interface ClientDashboardContentProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  onEquipmentSetupClick?: () => void;
  onBackToDashboard?: () => void;
  userMode: UserMode;
  switchMode?: () => void;
}

const ClientDashboardContent = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  onEquipmentSetupClick,
  onBackToDashboard,
  userMode,
  switchMode
}: ClientDashboardContentProps) => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'equipment'>('dashboard');
  const navigate = useNavigate();

  const handleEquipmentSetupClick = () => {
    if (onEquipmentSetupClick) {
      onEquipmentSetupClick();
    } else {
      setCurrentView('equipment');
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title={`Client Portal - ${userMode === 'management' ? 'Management Mode' : 'Provider Mode'}`}
        portalType="business"
        userMode={userMode}
        switchMode={switchMode}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout} 
          onEquipmentSetupClick={handleEquipmentSetupClick}
          portalType="business"
          userMode={userMode}
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          {userMode === 'management' && (
            <div className="bg-forgemate-orange/10 border border-forgemate-orange/20 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <Badge className="bg-forgemate-orange mr-2">Management Mode</Badge>
                <span className="text-forgemate-orange text-sm">You are currently in Management Mode with full administrative capabilities.</span>
              </div>
            </div>
          )}
          
          {userMode === 'provider' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <Badge className="bg-green-500 mr-2">Provider Mode</Badge>
                <span className="text-green-700 text-sm">You are currently in Provider Mode with service delivery capabilities.</span>
              </div>
            </div>
          )}
          
          {currentView === 'dashboard' ? (
            <OperationsOverview userMode={userMode} />
          ) : (
            <EquipmentSetup onBackToDashboard={handleBackToDashboard} />
          )}
        </main>
      </div>
    </div>
  );
};

export default ClientDashboardContent;
