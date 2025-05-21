import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, Users, Building, Calendar, FileText, 
  Bell, DollarSign, ClipboardCheck, Settings, ArrowRight,
  BarChart, PieChart, TrendingUp, Activity, AlertTriangle,
  CheckCircle, Shield, Briefcase, ExternalLink
} from 'lucide-react';
import BusinessDashboardOverview from './dashboard/BusinessDashboardOverview';
import ContractorsModule from './dashboard/ContractorsModule';
import SitesModule from './dashboard/SitesModule';
import SchedulingModule from './dashboard/SchedulingModule';
import DocumentsModule from './dashboard/DocumentsModule';
import NotificationsModule from './dashboard/NotificationsModule';
import BillingModule from './dashboard/BillingModule';
import ReportingModule from '@/components/reporting/ReportingModule';
import ConfigurationModule from './dashboard/ConfigurationModule';

interface BusinessPortalDashboardProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
}

const BusinessPortalDashboard = ({ 
  switchRole, 
  userRole, 
  handleLogout 
}: BusinessPortalDashboardProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const tabParam = queryParams.get('tab');
  const sectionParam = queryParams.get('section');
  
  const [activeTab, setActiveTab] = useState(tabParam || 'dashboard');
  const [activeSitesSection, setActiveSitesSection] = useState(sectionParam || 'management');
  
  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
    
    if (sectionParam) {
      setActiveSitesSection(sectionParam);
    }
  }, [tabParam, sectionParam]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const params = new URLSearchParams(location.search);
    params.set('tab', value);
    
    if (value === 'sites' && !params.get('section')) {
      params.set('section', activeSitesSection);
    }
    
    navigate(`/dashboard?${params.toString()}`);
  };

  const quickStats = [
    { title: "Sites", value: "12", icon: Building, color: "bg-forgemate-orange/10 text-forgemate-orange" },
    { title: "Contractors", value: "28", icon: Users, color: "bg-purple-100 text-purple-600" },
    { title: "Open Tasks", value: "37", icon: ClipboardCheck, color: "bg-amber-100 text-amber-600" },
    { title: "Compliance", value: "92%", icon: Shield, color: "bg-green-100 text-green-600" }
  ];

  const handleNavigateToSites = () => {
    navigate('/sites/management');
  };

  return (
    <div className="w-full min-h-screen bg-[#f5f2ff]">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Business Portal"
        portalType="business"
      />
      
      <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
        <div className="bg-gradient-to-r from-[#7851CA] to-[#9b87f5] rounded-xl p-6 mb-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2">Welcome to Your Business Portal</h1>
              <p className="text-white/80 max-w-2xl">Manage your facilities, track compliance status, and oversee contractor performance all in one place.</p>
            </div>
            <Button 
              onClick={switchRole}
              className="mt-4 md:mt-0 bg-white text-[#7851CA] hover:bg-white/90"
            >
              Switch to Contractor Portal
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs 
          defaultValue="dashboard" 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="w-full"
        >
          <div className="mb-6 overflow-x-auto border-b">
            <TabsList className="inline-flex w-full md:w-auto bg-transparent p-0">
              <TabsTrigger value="dashboard" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="contractors" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Contractors</span>
              </TabsTrigger>
              <TabsTrigger value="sites" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <Building className="h-4 w-4" />
                <span className="hidden sm:inline">Sites</span>
              </TabsTrigger>
              <TabsTrigger value="scheduling" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Scheduling</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <DollarSign className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="reporting" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <BarChart className="h-4 w-4" />
                <span className="hidden sm:inline">Reporting</span>
              </TabsTrigger>
              <TabsTrigger value="configuration" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow rounded-t-md px-4 py-2 border-b-2 data-[state=active]:border-forgemate-orange data-[state=inactive]:border-transparent">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <BusinessDashboardOverview />
          </TabsContent>
          
          <TabsContent value="contractors" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <ContractorsModule />
          </TabsContent>
          
          <TabsContent value="sites" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <SitesModule initialSection={activeSitesSection} />
          </TabsContent>
          
          <TabsContent value="scheduling" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <SchedulingModule />
          </TabsContent>
          
          <TabsContent value="documents" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <DocumentsModule />
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <NotificationsModule />
          </TabsContent>
          
          <TabsContent value="billing" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <BillingModule />
          </TabsContent>
          
          <TabsContent value="reporting" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <ReportingModule />
          </TabsContent>
          
          <TabsContent value="configuration" className="mt-0 bg-white p-6 rounded-lg shadow-md">
            <ConfigurationModule />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BusinessPortalDashboard;
