import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useCommonSidebarLinks, UserMode } from './hooks/useSidebarLinks';
import SidebarSection from './SidebarSection';
import SidebarMenuItem from './SidebarMenuItem';
import { 
  LayoutDashboard, 
  BarChart,
  FileBarChart,
  Briefcase,
  ListChecks,
  Calendar,
  FileCheck,
  Settings,
  ClipboardList,
  Wrench,
  Shield,
  UserCheck,
  Users,
  Clipboard,
  MapPin,
  Building,
  Package,
  FileText,
  Folder,
  Archive,
  DollarSign,
  Receipt,
  Wallet,
  UserCog,
  Bell,
  Cog,
  Link,
  FileSpreadsheet,
  CheckSquare,
  BarChart2,
  Tag,
  Zap,
  Lightbulb,
  Thermometer,
  Wind,
  Droplet,
  List,
  FileDown,
  FilePlus2,
  UserPlus,
  Medal,
  Award,
  ShieldCheck,
  Hammer,
  CreditCard,
  User,
  LineChart,
  Mail
} from 'lucide-react';

interface BusinessSidebarContentProps {
  onEquipmentSetupClick?: () => void;
  onAssetManagementClick?: () => void;
  userMode?: UserMode;
  handleLogout?: () => void;
}

interface ExpandedSections {
  overview: boolean;
  reporting: boolean;
  dashboard: boolean;
  analytics: boolean;
  jobManagement: boolean;
  contractorManagement: boolean;
  equipmentManagement: boolean;
  employeeManagement: boolean;
  siteManagement: boolean;
  settings: boolean;
  financial: boolean;
  clientManagement: boolean;
  reportingSection: boolean;
  profileManagement: boolean;
}

const BusinessSidebarContent = ({
  onEquipmentSetupClick,
  onAssetManagementClick,
  userMode = 'management',
  handleLogout
}: BusinessSidebarContentProps) => {
  const sidebarLinks = useCommonSidebarLinks('business', userMode);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Set the complete state including all sections used in the component
  const [expandedSections, setExpandedSections] = useState<ExpandedSections>({
    overview: true,
    reporting: false,
    dashboard: true,
    analytics: false,
    jobManagement: false,
    contractorManagement: false,
    equipmentManagement: false,
    employeeManagement: true, // Set to true to show expanded by default
    siteManagement: false,
    settings: false,
    financial: false,
    clientManagement: false,
    reportingSection: false,
    profileManagement: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (userMode === 'provider') {
    return (
      <>
        <SidebarSection 
          title="OVERVIEW" 
          icon={LayoutDashboard}
          isExpanded={expandedSections.overview}
          onToggle={() => toggleSection('overview')}
        >
          <SidebarMenuItem
            to="/dashboard"
            title="Dashboard"
            icon={LayoutDashboard}
            size="sm"
          />
        </SidebarSection>

        <SidebarSection 
          title="JOBS" 
          icon={Briefcase}
          isExpanded={expandedSections.jobManagement}
          onToggle={() => toggleSection('jobManagement')}
        >
          <SidebarMenuItem
            to="/business/provider/jobs"
            title="My Assigned Jobs"
            icon={ClipboardList}
            size="sm"
          />
        </SidebarSection>

        <SidebarSection
          title="MY PROFILE"
          icon={User}
          isExpanded={expandedSections.profileManagement}
          onToggle={() => toggleSection('profileManagement')}
        >
          <SidebarMenuItem
            to="/profile"
            title="My Profile"
            icon={User}
            size="sm"
          />
          <SidebarMenuItem
            to="/settings"
            title="Settings"
            icon={Settings}
            size="sm"
          />
        </SidebarSection>
      </>
    );
  }

  return (
    <>
      {/* Dashboard as a top-level item */}
      <SidebarMenuItem
        to="/dashboard"
        title="Dashboard"
        icon={LayoutDashboard}
        size="md"
      />

      {/* JOB MANAGEMENT section */}
      <SidebarSection 
        title="JOB MANAGEMENT" 
        icon={Briefcase}
        isExpanded={expandedSections.jobManagement}
        onToggle={() => toggleSection('jobManagement')}
      >
        <SidebarMenuItem
          to="/jobs/assign"
          title="Assign a job"
          icon={UserPlus}
          size="sm"
        />
        <SidebarMenuItem
          to="/jobs/active"
          title="Active Jobs"
          icon={ClipboardList}
          size="sm"
        />
        <SidebarMenuItem
          to="/reports/completed-jobs"
          title="Completed Jobs"
          icon={CheckSquare}
          size="sm"
        />
      </SidebarSection>

      {/* CONTRACTOR MANAGEMENT */}
      <SidebarSection
        title="CONTRACTOR MANAGEMENT"
        icon={Briefcase}
        isExpanded={expandedSections.contractorManagement}
        onToggle={() => toggleSection('contractorManagement')}
      >
        <SidebarMenuItem
          to="/contractors"
          title="Contractor Directory"
          icon={User}
          size="sm"
        />
        <SidebarMenuItem
          to="/performance-ratings"
          title="Performance Ratings"
          icon={Medal}
          size="sm"
        />
        <SidebarMenuItem
          to="/license-tracking"
          title="License Tracking"
          icon={ShieldCheck}
          size="sm"
        />
        <SidebarMenuItem
          to="/insurance-tracking"
          title="Insurance Tracking"
          icon={Shield}
          size="sm"
        />
      </SidebarSection>

      {/* EMPLOYEE MANAGEMENT */}
      <SidebarSection
        title="EMPLOYEE MANAGEMENT"
        icon={UserCog}
        isExpanded={expandedSections.employeeManagement}
        onToggle={() => toggleSection('employeeManagement')}
      >
        <SidebarMenuItem
          to="/employees"
          title="Employees Directory"
          icon={Users}
          size="sm"
        />
        <SidebarMenuItem
          to="/employees/safety-officers"
          title="Safety Officers"
          icon={Shield}
          size="sm"
        />
        <SidebarMenuItem
          to="/employees/invitations"
          title="Invite Employees"
          icon={Mail}
          size="sm"
        />
      </SidebarSection>

      {/* EQUIPMENT MANAGEMENT */}
      <SidebarSection 
        title="EQUIPMENT MANAGEMENT" 
        icon={Hammer}
        isExpanded={expandedSections.equipmentManagement}
        onToggle={() => toggleSection('equipmentManagement')}
      >
   
        <SidebarMenuItem
          to="/equipment"
          title="Equipment Directory"
          icon={Package}
          size="sm"
        />
      </SidebarSection>

      <SidebarSection 
        title="SITE MANAGEMENT" 
        icon={Building}
        isExpanded={expandedSections.siteManagement}
        onToggle={() => toggleSection('siteManagement')}
      >
        <SidebarMenuItem
          to="/sites"
          title="Sites"
          icon={Building}
          size="sm"
        />
        <SidebarMenuItem
          to="/sites/locations"
          title="Locations"
          icon={MapPin}
          size="sm"
        />
        {/* Floor Plans */}
        <SidebarMenuItem
          to="/sites/floor-plans"
          title="Floor Plans"
          icon={MapPin}
          size="sm"
        />
      </SidebarSection>

      {/* REPORTING section - moved to appear before SETTINGS */}
      <SidebarSection 
        title="REPORTING" 
        icon={FileBarChart}
        isExpanded={expandedSections.reporting}
        onToggle={() => toggleSection('reporting')}
      >
        <SidebarMenuItem
          to="/reports"
          title="Reports"
          icon={FileBarChart}
          size="sm"
        />
        <SidebarMenuItem
          to="/analytics"
          title="Analytics"
          icon={BarChart}
          size="sm"
        />
      </SidebarSection>

      {/*<SidebarSection 
        title="FINANCIAL" 
        icon={DollarSign}
        isExpanded={expandedSections.financial}
        onToggle={() => toggleSection('financial')}
      >
        <SidebarMenuItem
          to="/financial/invoices"
          title="Invoices & Payments"
          icon={Receipt}
          size="sm"
        />
        <SidebarMenuItem
          to="/financial/budget"
          title="Budget Allocation"
          icon={Wallet}
          size="sm"
        />
        <SidebarMenuItem
          to="/financial/reporting"
          title="Cost Reporting"
          icon={BarChart}
          size="sm"
        />
      </SidebarSection>*/}

      <SidebarSection 
        title="USER ADMINISTRATION" 
        icon={UserCog}
        isExpanded={expandedSections.settings}
        onToggle={() => toggleSection('settings')}
      >
        <SidebarMenuItem
          to="/settings/user-approval"
          title="User Approval"
          icon={UserCheck}
          size="sm"
        />
        <SidebarMenuItem
          to="/settings/notifications"
          title="Notification Preferences"
          icon={Bell}
          size="sm"
        />
      </SidebarSection>
    </>
  );
};

export default BusinessSidebarContent;
