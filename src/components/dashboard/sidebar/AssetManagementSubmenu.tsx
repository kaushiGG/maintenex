
import React from 'react';
import { Wrench, Package, QrCode, AlertTriangle, MapPin } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarMenuItem from './SidebarMenuItem';

interface AssetManagementSubmenuProps {
  onEquipmentSetupClick?: () => void;
  onAssetManagementClick?: () => void;
  portalType?: 'business' | 'contractor';
}

const AssetManagementSubmenu = ({ 
  onEquipmentSetupClick,
  onAssetManagementClick,
  portalType = 'business' 
}: AssetManagementSubmenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine the base path according to portal type
  const basePath = portalType === 'contractor' ? '/contractor/assets' : '/assets';
  
  return (
    <div className="py-2">
      <div className="space-y-1">
        <SidebarMenuItem 
          icon={Wrench} 
          title="Equipment Setup" 
          to="/equipment/dashboard"
          isActive={location.pathname === '/equipment/dashboard'}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={Package} 
          title="Asset Management" 
          to="/assets"
          isActive={location.pathname === '/assets'}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={QrCode} 
          title="QR Code Generator" 
          to="/assets?tab=qrcode"
          isActive={location.pathname === '/assets' && location.search.includes('tab=qrcode')}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={MapPin} 
          title="Equipment Locations" 
          to="/assets?tab=locations"
          isActive={location.pathname === '/assets' && location.search.includes('tab=locations')}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={AlertTriangle} 
          title="Missing Equipment" 
          to="/assets?tab=missing"
          isActive={location.pathname === '/assets' && location.search.includes('tab=missing')}
          size="sm"
        />
      </div>
    </div>
  );
};

export default AssetManagementSubmenu;
