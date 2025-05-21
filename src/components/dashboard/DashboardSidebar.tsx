import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useCommonSidebarLinks, UserMode } from './sidebar/hooks/useSidebarLinks';
import BusinessSidebarContent from './sidebar/BusinessSidebarContent';
import ContractorSidebarContent from './sidebar/ContractorSidebarContent';
import EmployeeSidebarContent from './sidebar/EmployeeSidebarContent';
import SidebarHeader from './sidebar/SidebarHeader';

interface DashboardSidebarProps {
  handleLogout: () => void;
  onEquipmentSetupClick?: () => void;
  onAssetManagementClick?: () => void;
  portalType?: 'business' | 'contractor' | 'employee';
  userMode?: UserMode;
}

const DashboardSidebar = ({
  handleLogout,
  onEquipmentSetupClick,
  onAssetManagementClick,
  portalType = 'business',
  userMode = 'management'
}: DashboardSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    handleLogout();
    // Navigate to login as fallback
    navigate('/login');
  };

  const renderSidebarContent = () => {
    switch (portalType) {
      case 'business':
        return (
          <BusinessSidebarContent 
            onEquipmentSetupClick={onEquipmentSetupClick} 
            onAssetManagementClick={onAssetManagementClick} 
            userMode={userMode} 
          />
        );
      case 'contractor':
        return <ContractorSidebarContent />;
      case 'employee':
        return <EmployeeSidebarContent />;
      default:
        return <BusinessSidebarContent userMode={userMode} />;
    }
  };

  return (
    <div className="h-full min-h-screen w-64 bg-white shadow-md hidden md:block">
      <div className="flex flex-col h-full p-4">
        <SidebarHeader portalType={portalType} />

        <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
          {renderSidebarContent()}
        </nav>

        <div className="pt-4 border-t border-gray-200">
          <button 
            onClick={handleLogoutClick} 
            className="flex items-center w-full px-3 py-2 text-sm rounded-md hover:bg-[#7851CA]/10 transition-colors text-zinc-950"
          >
            <LogOut size={18} className="mr-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;