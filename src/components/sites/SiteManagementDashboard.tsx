import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Search, 
  PlusCircle, 
  Users,
  ArrowLeft,
  Layers,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Site } from '@/types/site';
import { Contractor } from '@/types/contractor';
import SitesTable from './SitesTable';
import AssignmentsTable from './AssignmentsTable';
import SiteForm, { SiteFormData } from './SiteForm';
import ContractorAssignmentForm from './ContractorAssignmentForm';
import SitesManagement from './SitesManagement';

// Mock contractors data
const mockContractors: Contractor[] = [
  { 
    id: '1', 
    name: 'Brisbane Electrics', 
    serviceType: 'Electrical',
    service_type: 'Electrical', 
    credentials: 'License #12345',
    status: 'Active',
    contactEmail: 'info@brisbaneelectrics.com',
    contactPhone: '07 1234 5678',
    contact_email: 'info@brisbaneelectrics.com',
    contact_phone: '07 1234 5678',
    location: 'Brisbane, QLD'
  },
  { 
    id: '2', 
    name: 'Sydney Services', 
    serviceType: 'Plumbing',
    service_type: 'Plumbing', 
    credentials: 'License #67890',
    status: 'Active',
    contactEmail: 'info@sydneyservices.com',
    contactPhone: '02 2345 6789',
    contact_email: 'info@sydneyservices.com',
    contact_phone: '02 2345 6789',
    location: 'Sydney, NSW'
  },
  { 
    id: '3', 
    name: 'Melbourne Maintenance', 
    serviceType: 'General Maintenance',
    service_type: 'General Maintenance', 
    credentials: 'License #24680',
    status: 'Active',
    contactEmail: 'info@melbournemaintenance.com',
    contactPhone: '03 3456 7890',
    contact_email: 'info@melbournemaintenance.com',
    contact_phone: '03 3456 7890',
    location: 'Melbourne, VIC'
  },
  { 
    id: '4', 
    name: 'Perth Services', 
    serviceType: 'HVAC',
    service_type: 'HVAC', 
    credentials: 'License #13579',
    status: 'Active',
    contactEmail: 'info@perthservices.com',
    contactPhone: '08 4567 8901',
    contact_email: 'info@perthservices.com',
    contact_phone: '08 4567 8901',
    location: 'Perth, WA'
  },
  { 
    id: '5', 
    name: 'Gold Coast Services', 
    serviceType: 'Security',
    service_type: 'Security', 
    credentials: 'License #97531',
    status: 'Active',
    contactEmail: 'info@goldcoastservices.com',
    contactPhone: '07 5678 9012',
    contact_email: 'info@goldcoastservices.com',
    contact_phone: '07 5678 9012',
    location: 'Gold Coast, QLD'
  }
];

// Mock equipment data
const mockEquipment = [
  { id: '1', name: 'Air Conditioner', category: 'HVAC', status: 'Operational', lastService: '2023-05-15' },
  { id: '2', name: 'Generator', category: 'Power', status: 'Maintenance Required', lastService: '2023-02-10' },
  { id: '3', name: 'Security Camera System', category: 'Security', status: 'Operational', lastService: '2023-06-01' },
  { id: '4', name: 'Fire Alarm System', category: 'Safety', status: 'Operational', lastService: '2023-04-20' },
  { id: '5', name: 'Access Control System', category: 'Security', status: 'Operational', lastService: '2023-03-05' },
];

// Enhanced mock sites data with compliance status, assigned contractors, and equipment
const mockSites: Site[] = [
  { 
    id: '1', 
    name: 'Brisbane Office', 
    address: '123 Brisbane St, Brisbane QLD', 
    itemCount: 45,
    complianceStatus: 'compliant',
    assignedContractors: ['Brisbane Electrics', 'QLD Maintenance'],
    equipment: [mockEquipment[0], mockEquipment[3], mockEquipment[4]],
    site_type: 'office',
    contact_email: 'brisbane@example.com',
    contact_phone: '07 1234 5678'
  },
  { 
    id: '2', 
    name: 'Sydney Headquarters', 
    address: '456 Sydney Rd, Sydney NSW', 
    itemCount: 72,
    complianceStatus: 'warning',
    assignedContractors: ['Sydney Services', 'NSW Electrics'],
    equipment: [mockEquipment[1], mockEquipment[2]],
    site_type: 'headquarters',
    contact_email: 'sydney@example.com',
    contact_phone: '02 2345 6789'
  },
  { 
    id: '3', 
    name: 'Melbourne Branch', 
    address: '789 Melbourne Ave, Melbourne VIC', 
    itemCount: 38,
    complianceStatus: 'non-compliant',
    assignedContractors: ['Melbourne Maintenance'],
    equipment: [mockEquipment[0], mockEquipment[1]],
    site_type: 'branch',
    contact_email: 'melbourne@example.com',
    contact_phone: '03 3456 7890'
  },
  { 
    id: '4', 
    name: 'Perth Office', 
    address: '321 Perth Blvd, Perth WA', 
    itemCount: 29,
    complianceStatus: 'compliant',
    assignedContractors: ['Perth Services', 'WA Electrics'],
    equipment: [mockEquipment[2], mockEquipment[3]],
    site_type: 'office',
    contact_email: 'perth@example.com',
    contact_phone: '08 4567 8901'
  },
  { 
    id: '5', 
    name: 'Adelaide Center', 
    address: '654 Adelaide Ln, Adelaide SA', 
    itemCount: 31,
    complianceStatus: 'warning',
    assignedContractors: ['Adelaide Maintenance'],
    equipment: [mockEquipment[4]],
    site_type: 'center',
    contact_email: 'adelaide@example.com',
    contact_phone: '08 5678 9012'
  },
  { 
    id: '6', 
    name: 'Gold Coast Facility', 
    address: '987 Gold Coast Hwy, Gold Coast QLD', 
    itemCount: 24,
    complianceStatus: 'compliant',
    assignedContractors: ['Gold Coast Services', 'QLD Electrics'],
    equipment: [mockEquipment[0], mockEquipment[2], mockEquipment[3]],
    site_type: 'facility',
    contact_email: 'goldcoast@example.com',
    contact_phone: '07 6789 0123'
  }
];

const SiteManagementDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTab, setCurrentTab] = useState('sites');
  const [sites, setSites] = useState<Site[]>(mockSites);
  const [editingSite, setEditingSite] = useState<SiteFormData | null>(null);
  const [isAddSiteDialogOpen, setIsAddSiteDialogOpen] = useState(false);
  const [isAssignContractorDialogOpen, setIsAssignContractorDialogOpen] = useState(false);
  const [selectedSiteForContractor, setSelectedSiteForContractor] = useState<Site | null>(null);
  const [selectedContractor, setSelectedContractor] = useState<string>("");
  const [selectedSiteDetails, setSelectedSiteDetails] = useState<Site | null>(null);
  
  // Filter sites and contractors based on search query
  const filteredSites = sites.filter(site => 
    site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    site.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Initialize form for adding/editing a site
  const initSiteForm = (site?: Site) => {
    if (site) {
      setEditingSite({
        id: site.id,
        name: site.name,
        address: site.address,
        complianceStatus: site.complianceStatus,
        assignedContractors: [...site.assignedContractors],
        equipment: [...site.equipment]
      });
    } else {
      setEditingSite({
        name: '',
        address: '',
        complianceStatus: 'compliant',
        assignedContractors: [],
        equipment: []
      });
    }
  };

  // Handle dialog submit for adding/editing a site
  const handleSiteFormSubmit = () => {
    if (!editingSite) return;
    
    if (editingSite.id) {
      // Edit existing site
      setSites(prev => prev.map(site => 
        site.id === editingSite.id ? { ...site, ...editingSite, itemCount: site.itemCount } : site
      ));
      toast.success(`Site "${editingSite.name}" has been updated`);
    } else {
      // Add new site
      const newSite: Site = {
        ...editingSite,
        id: `${Date.now()}`,
        itemCount: 0,
        site_type: 'office', // Default site type
        contact_email: 'contact@example.com', // Default contact email
        contact_phone: '000-000-0000' // Default contact phone
      };
      setSites(prev => [...prev, newSite]);
      toast.success(`Site "${editingSite.name}" has been added`);
    }
    
    setIsAddSiteDialogOpen(false);
    setEditingSite(null);
  };

  // Handle site deletion
  const handleDeleteSite = (siteId: string) => {
    const siteToDelete = sites.find(site => site.id === siteId);
    if (!siteToDelete) return;
    
    setSites(prev => prev.filter(site => site.id !== siteId));
    toast.success(`Site "${siteToDelete.name}" has been deleted`);
  };

  // Handle site selection for detailed view of contractors
  const handleSiteSelection = (site: Site) => {
    setSelectedSiteDetails(site);
  };

  // Handle assigning contractor to site
  const handleAssignContractor = () => {
    if (!selectedSiteForContractor || !selectedContractor) return;
    
    // Check if contractor is already assigned to this site
    if (selectedSiteForContractor.assignedContractors.includes(selectedContractor)) {
      toast.error(`Contractor is already assigned to this site`);
      return;
    }
    
    setSites(prev => prev.map(site => 
      site.id === selectedSiteForContractor.id 
        ? { 
            ...site, 
            assignedContractors: [...site.assignedContractors, selectedContractor] 
          } 
        : site
    ));
    
    toast.success(`Contractor assigned to ${selectedSiteForContractor.name}`);
    setIsAssignContractorDialogOpen(false);
    setSelectedSiteForContractor(null);
    setSelectedContractor("");
  };

  // Handle removing contractor from site
  const handleRemoveContractor = (siteId: string, contractor: string) => {
    const site = sites.find(site => site.id === siteId);
    if (!site) return;
    
    setSites(prev => prev.map(s => 
      s.id === siteId 
        ? { 
            ...s, 
            assignedContractors: s.assignedContractors.filter(c => c !== contractor)
          } 
        : s
    ));
    
    toast.success(`Contractor removed from ${site.name}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Building className="mr-2 h-6 w-6 text-[#7851CA]" />
              Site Management
            </h1>
            <p className="text-gray-500 mt-1">Manage sites and their assigned contractors</p>
          </div>
          
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex space-x-2">
            <div className="relative flex-grow sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              className="bg-[#3b82f6] hover:bg-[#2563eb]"
              onClick={() => {
                initSiteForm();
                setIsAddSiteDialogOpen(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Site
            </Button>
          </div>
        </div>
        
        <Tabs 
          value={currentTab} 
          onValueChange={setCurrentTab}
          className="w-full mb-6"
        >
          <TabsList className="mb-4">
            <TabsTrigger value="sites">
              <Building className="h-4 w-4 mr-2" />
              Sites
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <Users className="h-4 w-4 mr-2" />
              Contractor Assignments
            </TabsTrigger>
            <TabsTrigger value="services">
              <Layers className="h-4 w-4 mr-2" />
              Site Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sites" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Site Locations</CardTitle>
                <CardDescription>
                  Manage your business site locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SitesTable 
                  sites={filteredSites}
                  onEdit={(site) => {
                    initSiteForm(site);
                    setIsAddSiteDialogOpen(true);
                  }}
                  onDelete={handleDeleteSite}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="assignments" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Site Details</CardTitle>
                <CardDescription>
                  View contractors and equipment assigned to each site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Sites</h3>
                    <div className="space-y-2">
                      {filteredSites.map((site) => (
                        <div 
                          key={site.id}
                          className={`p-3 border rounded cursor-pointer transition-colors ${
                            selectedSiteDetails?.id === site.id 
                              ? 'bg-[#7851CA]/10 border-[#7851CA]' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSiteSelection(site)}
                        >
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-gray-500">{site.address}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <div className="grid grid-cols-1 gap-6">
                      {/* Contractors Section */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Users className="h-5 w-5 mr-2 text-[#7851CA]" />
                          {selectedSiteDetails
                            ? `Contractors assigned to ${selectedSiteDetails.name}` 
                            : 'Select a site to view assigned contractors'}
                        </h3>
                        {selectedSiteDetails ? (
                          selectedSiteDetails.assignedContractors && selectedSiteDetails.assignedContractors.length > 0 ? (
                            <div className="space-y-2">
                              {selectedSiteDetails.assignedContractors.map((contractor, idx) => (
                                <div key={idx} className="p-3 border rounded bg-white">
                                  <div className="font-medium">{contractor}</div>
                                  <div className="flex justify-end mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-500 border-red-200 hover:bg-red-50"
                                      onClick={() => handleRemoveContractor(selectedSiteDetails.id, contractor)}
                                    >
                                      Remove
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No contractors assigned to this site
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Select a site from the left to view assigned contractors
                          </div>
                        )}
                      </div>

                      {/* Equipment Section */}
                      <div className="border rounded-lg p-4">
                        <h3 className="text-lg font-medium mb-4 flex items-center">
                          <Package className="h-5 w-5 mr-2 text-[#7851CA]" />
                          {selectedSiteDetails
                            ? `Equipment at ${selectedSiteDetails.name}` 
                            : 'Select a site to view equipment'}
                        </h3>
                        {selectedSiteDetails ? (
                          selectedSiteDetails.equipment && selectedSiteDetails.equipment.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {selectedSiteDetails.equipment.map((item) => (
                                    <tr key={item.id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                          ${item.status === 'Operational' ? 'bg-green-100 text-green-800' : 
                                            item.status === 'Maintenance Required' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`}>
                                          {item.status}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              No equipment found at this site
                            </div>
                          )
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            Select a site from the left to view equipment
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services" className="mt-0">
            <Card>
              <CardHeader>
                <CardTitle>Site Services</CardTitle>
                <CardDescription>
                  View and manage all services across your sites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SitesManagement portalType="business" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Add/Edit Site Dialog */}
        <Dialog open={isAddSiteDialogOpen} onOpenChange={setIsAddSiteDialogOpen}>
          <DialogContent>
            <SiteForm 
              editingSite={editingSite}
              setEditingSite={setEditingSite}
              onCancel={() => setIsAddSiteDialogOpen(false)}
              onSubmit={handleSiteFormSubmit}
            />
          </DialogContent>
        </Dialog>
        
        {/* Assign Contractor Dialog */}
        <Dialog 
          open={isAssignContractorDialogOpen} 
          onOpenChange={setIsAssignContractorDialogOpen}
        >
          <DialogContent>
            <ContractorAssignmentForm 
              sites={sites}
              contractors={mockContractors}
              selectedSite={selectedSiteForContractor}
              selectedContractor={selectedContractor}
              onSiteChange={(siteId) => {
                const site = sites.find(s => s.id === siteId) || null;
                setSelectedSiteForContractor(site);
              }}
              onContractorChange={setSelectedContractor}
              onCancel={() => setIsAssignContractorDialogOpen(false)}
              onSubmit={handleAssignContractor}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SiteManagementDashboard;
