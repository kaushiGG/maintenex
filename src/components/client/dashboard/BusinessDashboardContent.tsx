import React, { useState } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import OperationsOverview from './OperationsOverview';
import EquipmentSetup from '@/components/equipment/EquipmentSetup';
import { useNavigate } from 'react-router-dom';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import { Badge } from '@/components/ui/badge';
import { User } from '@supabase/supabase-js';
interface BusinessDashboardContentProps {
  switchRole: (() => void) | null;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  onEquipmentSetupClick?: () => void;
  onBackToDashboard?: () => void;
  userMode: UserMode;
  switchMode?: () => void;
  children?: React.ReactNode;
  userData?: User | null;
}
const BusinessDashboardContent: React.FC<BusinessDashboardContentProps> = ({
  switchRole,
  userRole,
  handleLogout,
  onEquipmentSetupClick,
  onBackToDashboard,
  userMode,
  switchMode,
  children,
  userData
}) => {
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

  // Get user name from metadata
  const firstName = userData?.user_metadata?.firstName || '';
  const lastName = userData?.user_metadata?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Business User';
  const email = userData?.email || 'business@example.com';
  return <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader switchRole={switchRole} userRole={userRole} handleLogout={handleLogout} title={`Business Portal - ${userMode === 'management' ? 'Management Mode' : 'Provider Mode'}`} portalType="business" userMode={userMode} switchMode={switchMode} userData={{
      fullName,
      email,
      userType: 'business'
    }} />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar handleLogout={handleLogout} onEquipmentSetupClick={handleEquipmentSetupClick} portalType="business" userMode={userMode} />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          {userMode === 'management' && <div className="border border-forgemate-orange/20 p-4 mb-4 rounded-sm bg-forgemate-orange/5">
              <div className="flex items-center">
                <Badge className="mr-2 bg-forgemate-orange">Management Mode</Badge>
                <span className="text-sm text-forgemate-orange">You are currently in Management Mode with full administrative capabilities.</span>
              </div>
            </div>}
          
          {userMode === 'provider' && <div className="bg-black border border-[#FF6B00]/20 rounded-md p-4 mb-4">
              <div className="flex items-center">
                <Badge className="bg-[#FF6B00] mr-2">Provider Mode</Badge>
                <span className="text-white text-sm">You are currently in Provider Mode with service delivery capabilities.</span>
              </div>
            </div>}
          
          {children ? children : currentView === 'dashboard' ? <OperationsOverview userMode={userMode} /> : <EquipmentSetup onBackToDashboard={handleBackToDashboard} />}
        </main>
      </div>
    </div>;
};
export default BusinessDashboardContent;