import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Users, Package, CheckCircle, FileText, ArrowLeft, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import SitesManagement from '@/components/sites/SitesManagement';
import SiteInventoryView from '@/components/sites/SiteInventoryView';
import SiteComplianceStatus from '@/components/sites/SiteComplianceStatus';
import SiteRequirements from '@/components/sites/SiteRequirements';
import { mockSites } from '@/components/sites/mockSiteData';
import ContractorAssignments from '@/components/sites/ContractorAssignments';

interface SitesModuleProps {
  initialSection?: string;
}

const SitesModule: React.FC<SitesModuleProps> = ({ initialSection = 'sites' }) => {
  const [activeTab, setActiveTab] = useState(initialSection);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  // Quick navigation to site management page
  const goToSiteManagement = () => {
    navigate('/sites/management');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-purple-700 hover:bg-purple-100 hover:text-purple-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
        
        <Button 
          onClick={goToSiteManagement}
          className="bg-purple-600 hover:bg-purple-700"
        >
          View Full Site Management
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building className="h-6 w-6 text-purple-700 mr-2" />
            Site Dashboard
          </h1>
          <p className="text-gray-500">Quick overview of your sites</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-grow sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4 bg-gray-100">
          <TabsTrigger value="sites" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Building className="h-4 w-4" />
            Sites
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Users className="h-4 w-4" />
            Contractor Assignments
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2 data-[state=active]:bg-white">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2 data-[state=active]:bg-white">
            <FileText className="h-4 w-4" />
            Requirements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Site Locations</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Manage your business site locations</p>
            </CardHeader>
            <CardContent>
              <SitesManagement portalType="business" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Assignments</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Manage which contractors are assigned to which sites</p>
            </CardHeader>
            <CardContent>
              <ContractorAssignments sites={Object.values(mockSites)} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Manage your equipment by site</p>
            </CardHeader>
            <CardContent>
              <SiteInventoryView viewType="inventory" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status by Location</CardTitle>
              <p className="text-gray-500 text-sm mt-1">Monitor compliance across all sites</p>
            </CardHeader>
            <CardContent>
              <SiteComplianceStatus />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Site Requirements & Regulations</CardTitle>
              <p className="text-gray-500 text-sm mt-1">View site-specific requirements and regulations</p>
            </CardHeader>
            <CardContent>
              <SiteRequirements />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SitesModule;
