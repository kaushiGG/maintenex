import React, { useState } from 'react';
import SiteManagementUI from '@/components/sites/SiteManagementUI';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddEditSiteForm from '@/components/sites/AddEditSiteForm';
import { Button } from '@/components/ui/button';
import { PlusCircle, Upload } from 'lucide-react';
import SiteImportModal from '@/components/sites/SiteImportModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SiteContractorDetails from '@/components/sites/SiteContractorDetails';

const SiteManagement = () => {
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('sites');

  const handleAddSite = () => {
    setIsAddSiteOpen(true);
  };

  const handleImportSites = () => {
    setIsImportOpen(true);
  };

  const handleAddSiteSuccess = () => {
    setIsAddSiteOpen(false);
    // Optional: add some refresh logic here if needed
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    // Optional: add some refresh logic here if needed
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Site Management</h1>
        <div className="flex space-x-2">
          <Button 
            onClick={handleImportSites} 
            variant="outline"
            className="text-orange-500 hover:text-white hover:bg-orange-500 border-orange-500"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Sites
          </Button>
          <Button 
            onClick={handleAddSite} 
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Site
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sites">Site Management</TabsTrigger>
          <TabsTrigger value="assignments">Site Contractors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites">
          <SiteManagementUI onImportClick={handleImportSites} />
        </TabsContent>
        
        <TabsContent value="assignments">
          <SiteContractorDetails />
        </TabsContent>
      </Tabs>

      <Dialog open={isAddSiteOpen} onOpenChange={setIsAddSiteOpen}>
        <DialogContent className="sm:max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Add New Site</h2>
          <AddEditSiteForm 
            onSuccess={handleAddSiteSuccess} 
            onCancel={() => setIsAddSiteOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <SiteImportModal 
          onClose={() => setIsImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </>
  );
};

export default SiteManagement;
