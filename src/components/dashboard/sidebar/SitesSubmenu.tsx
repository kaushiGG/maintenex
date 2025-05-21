import React from 'react';
import { 
  Building, 
  Settings,
  MapPin,
  List,
  Tag,
  Zap,
  Lightbulb,
  FileText,
  Users,
  LayoutTemplate,
  Package,
  ShieldCheck,
  ClipboardList,
  Wrench,
  Briefcase,
  Thermometer
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import SidebarMenuItem from './SidebarMenuItem';
import { Badge } from "@/components/ui/badge";

interface SitesSubmenuProps {
  portalType?: 'business' | 'contractor';
  userRole?: 'business' | 'contractor';
}

const SitesSubmenu = ({ 
  portalType = 'business', 
  userRole = 'business'
}: SitesSubmenuProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = userRole === 'business';
  const isBusiness = portalType === 'business';
  
  // Helper function to handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Helper function to handle external navigation
  const handleExternalNavigation = (url: string) => {
    window.location.href = url;
  };
  
  return (
    <div className="py-2">
      <div className="text-[#3b82f6] font-semibold text-sm mb-2">Site Management</div>
      
      <SidebarMenuItem 
        icon={Building} 
        title="All Sites" 
        to="/sites" 
        isActive={location.pathname === '/sites'}
        size="sm"
      />
      
      {/* Enhanced Site Management UI link */}
      <SidebarMenuItem 
        icon={Settings} 
        title="Site Management" 
        to="/sites/management" 
        isActive={location.pathname === '/sites/management'}
        size="sm"
        badge={
          <Badge className="bg-[#3b82f6] text-white text-xs">New</Badge>
        }
      />

      {/* Site Services subcategory */}
      <div className="ml-6 pl-4 border-l border-[#3b82f6] py-2">
        <div className="text-[#3b82f6]/80 text-xs mb-2">Site Services</div>
        
        <SidebarMenuItem 
          icon={Tag} 
          title="Testing & Tags" 
          to="/services/landing/test-a-tag"
          isActive={location.pathname === '/services/landing/test-a-tag'}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={Zap} 
          title="RCD Services" 
          to="/services/landing/rcd-testing"
          isActive={location.pathname === '/services/landing/rcd-testing'}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={Lightbulb} 
          title="Emergency & Exit Lighting" 
          to="/services/emergency-exit-lighting" 
          isActive={location.pathname === '/services/emergency-exit-lighting'}
          size="sm"
        />
        
        <SidebarMenuItem 
          icon={Thermometer} 
          title="Thermal Imaging" 
          to="/services/thermal-imaging?siteId=5&siteName=Adelaide%20Center&siteAddress=654%20Adelaide%20Ln%2C%20Adelaide%20SA" 
          isActive={location.pathname === '/services/thermal-imaging'}
          size="sm"
        />
      </div>
      
      {/* Site Maps subcategory */}
      <div className="ml-6 pl-4 border-l border-[#3b82f6] py-2">
        <div className="text-[#3b82f6]/80 text-xs mb-2">Site Maps</div>
        
        <SidebarMenuItem 
          icon={MapPin} 
          title="Add Floor Plans" 
          to="/sites/floor-plans"
          isActive={location.pathname === '/sites/floor-plans'}
          size="sm"
          onClick={() => navigate('/sites/floor-plans', { state: { initialTab: 'upload' } })}
        />
        
        <SidebarMenuItem 
          icon={MapPin} 
          title="View Floor Plans" 
          to="/sites/floor-plans"
          isActive={location.pathname === '/sites/floor-plans'}
          size="sm"
          onClick={() => navigate('/sites/floor-plans', { state: { initialTab: 'view' } })}
        />
        
        <SidebarMenuItem 
          icon={MapPin} 
          title="Site Locations Map" 
          to="/site-locations"
          isActive={location.pathname === '/site-locations'}
          size="sm"
          badge={
            <Badge className="bg-[#3b82f6] text-white text-xs">New</Badge>
          }
        />
      </div>
      
      {/* Business portal contractor features */}
      {isBusiness && (
        <>
          <div className="text-[#3b82f6] font-semibold text-sm mt-4 mb-2">Contractor Features</div>
          
          <SidebarMenuItem 
            icon={Briefcase} 
            title="My Jobs" 
            to="/jobs" 
            isActive={location.pathname === '/jobs'}
            size="sm"
          />
          
          <SidebarMenuItem 
            icon={ClipboardList} 
            title="Service Schedule" 
            to="/schedule" 
            isActive={location.pathname === '/schedule'}
            size="sm"
          />
        </>
      )}
      
      {/* Site Management Features - Link to tabs in the new UI */}
      {isAdmin && isBusiness && (
        <>
          <SidebarMenuItem 
            icon={MapPin} 
            title="Site Directory" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
          />
          
          <SidebarMenuItem 
            icon={Users} 
            title="Contractor Assignments" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
            onClick={() => navigate('/sites/management')}
          />
          
          <SidebarMenuItem 
            icon={LayoutTemplate} 
            title="Floor Plans" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
            onClick={() => navigate('/sites/management')}
          />
          
          <SidebarMenuItem 
            icon={Package} 
            title="Equipment Inventory" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
            onClick={() => navigate('/sites/management')}
          />
          
          <SidebarMenuItem 
            icon={ShieldCheck} 
            title="Compliance Status" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
            onClick={() => navigate('/sites/management')}
          />
          
          <SidebarMenuItem 
            icon={ClipboardList} 
            title="Site Requirements" 
            to="/sites/management" 
            isActive={location.pathname === '/sites/management'}
            size="sm"
            onClick={() => navigate('/sites/management')}
          />
        </>
      )}
    </div>
  );
};

export default SitesSubmenu;
