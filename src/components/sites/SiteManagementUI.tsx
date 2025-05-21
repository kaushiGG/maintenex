import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SitesManagement from './SitesManagement';
import SiteInventoryView from './SiteInventoryView';
import SiteComplianceStatus from './SiteComplianceStatus';
import SiteRequirements from './SiteRequirements';
import { mockSites } from './mockSiteData';
import ContractorAssignments from './ContractorAssignments';
import { Building, Users, Package, CheckCircle, FileText } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';
import SiteImportModal from './SiteImportModal';

interface SiteManagementUIProps {
  portalType?: 'business' | 'contractor';
  onImportClick?: () => void;
}

const SiteManagementUI: React.FC<SiteManagementUIProps> = ({
  portalType = 'business',
  onImportClick
}) => {
  const [activeTab, setActiveTab] = useState('sites');
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    // We'll let the SitesManagement component handle the refresh
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Site Management</h1>
        <p className="text-gray-500">
          Manage your business locations, contractor assignments, and inventory
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gray-100 p-1">
          <TabsTrigger value="sites" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Building className="h-4 w-4" />
            Sites
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Users className="h-4 w-4" />
            Contractor Assignments
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <Package className="h-4 w-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="requirements" className="flex items-center gap-2 data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            <FileText className="h-4 w-4" />
            Requirements
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites">
          <Card>
            <CardHeader>
              <CardTitle>Site Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <SitesManagement 
                portalType="business" 
                onImportClick={onImportClick || (() => setIsImportOpen(true))}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <ContractorAssignments />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Equipment Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteInventoryView viewType="inventory" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteComplianceStatus />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Site Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <SiteRequirements />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Import Sites Modal */}
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SiteImportModal 
          onClose={() => setIsImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default SiteManagementUI;
