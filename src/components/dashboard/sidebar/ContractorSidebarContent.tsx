import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useCommonSidebarLinks } from './hooks/useSidebarLinks';
import SidebarSection from './SidebarSection';
import SidebarMenuItem from './SidebarMenuItem';
import { 
  FileText, 
  Package, 
  Thermometer, 
  Droplet,
  HomeIcon,
  Briefcase,
  User,
  Calendar,
  Wrench,
  Bell,
  BarChart2,
  Clock,
  MapPin,
  Wallet,
  Settings,
  LifeBuoy,
  FileSpreadsheet,
  CheckCircle,
  ListCheck,
  ChevronDown,
  ChevronUp,
  ClipboardCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const ContractorSidebarContent = () => {
  const sidebarLinks = useCommonSidebarLinks('contractor');
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    main: true,
    account: true,
    reporting: true,
    completedWork: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  return (
    <>
      <SidebarSection 
        title="MAIN" 
        icon={HomeIcon}
        isExpanded={expandedSections.main}
        onToggle={() => toggleSection('main')}
        className="text-gray-600"
      >
        <SidebarMenuItem
          to="/contractor-dashboard"
          title="Dashboard"
          icon={HomeIcon}
          size="sm"
          isActive={isActive('/contractor-dashboard')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        <SidebarMenuItem
          to="/jobs/assigned"
          title="Assigned Jobs"
          icon={ListCheck}
          size="sm"
          isActive={isActive('/jobs/assigned')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        <SidebarMenuItem
          to="/jobs/completed"
          title="Completed Jobs"
          icon={CheckCircle}
          size="sm"
          isActive={isActive('/jobs/completed')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        <SidebarMenuItem
          to="/schedule"
          title="My Schedule"
          icon={Calendar}
          size="sm"
          isActive={isActive('/schedule')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        {/*<SidebarMenuItem
          to="/equipment"
          title="My Equipment"
          icon={Wrench}
          size="sm"
          isActive={isActive('/equipment')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />*/}
        
        <SidebarMenuItem
          to="/locations"
          title="Service Areas"
          icon={MapPin}
          size="sm"
          isActive={isActive('/locations')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
      </SidebarSection>
      
      <SidebarSection 
        title="REPORTING" 
        icon={FileSpreadsheet}
        isExpanded={expandedSections.reporting}
        onToggle={() => toggleSection('reporting')}
        className="text-gray-600"
      >
        <SidebarMenuItem
          to="/reports/performance"
          title="My Performance"
          icon={BarChart2}
          size="sm"
          isActive={location.pathname === '/reports/performance'}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        <SidebarMenuItem
          to="/reports/timesheet"
          title="Timesheet"
          icon={Clock}
          size="sm"
          isActive={location.pathname === '/reports/timesheet'}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
                
        <SidebarMenuItem
          to="/contractor/reports/completed-jobs"
          title="Completed Reports"
          icon={ClipboardCheck}
          size="sm"
          isActive={location.pathname === '/contractor/reports/completed-jobs'}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
      </SidebarSection>

      <SidebarSection 
        title="ACCOUNT" 
        icon={User}
        isExpanded={expandedSections.account}
        onToggle={() => toggleSection('account')}
        className="text-gray-600"
      >
        <SidebarMenuItem
          to="/profile"
          title="My Profile"
          icon={User}
          size="sm"
          isActive={isActive('/profile')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        {/* Payments menu item hidden
        <SidebarMenuItem
          to="/invoices"
          title="Payments"
          icon={Wallet}
          size="sm"
          isActive={isActive('/invoices')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        */}
        
        <SidebarMenuItem
          to="/settings"
          title="Settings"
          icon={Settings}
          size="sm"
          isActive={isActive('/settings')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
        
        <SidebarMenuItem
          to="/help"
          title="Help & Support"
          icon={LifeBuoy}
          size="sm"
          isActive={isActive('/help')}
          activeClassName="bg-pretance-light text-pretance-purple"
          hoverClassName="hover:bg-pretance-light hover:text-pretance-purple"
        />
      </SidebarSection>
    </>
  );
};

export default ContractorSidebarContent;
