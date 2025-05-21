import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, PlusCircle, MapPin, Filter, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import SitesTable from './SitesTable';
import { Site, ComplianceStatus, SiteEquipment } from '@/types/site';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddEditSiteForm from './AddEditSiteForm';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Equipment } from '@/types/equipment';
import SiteImportModal from './SiteImportModal';

interface SitesManagementProps {
  portalType: 'business' | 'contractor';
  onImportClick?: () => void;
}

// Mock equipment data for demonstration purposes (fallback only)
const mockEquipment: SiteEquipment[] = [
  { id: '1', name: 'Air Conditioner', category: 'HVAC', status: 'Operational', lastService: '2023-05-15' },
  { id: '2', name: 'Generator', category: 'Power', status: 'Maintenance Required', lastService: '2023-02-10' },
  { id: '3', name: 'Security Camera System', category: 'Security', status: 'Operational', lastService: '2023-06-01' },
  { id: '4', name: 'Fire Alarm System', category: 'Safety', status: 'Operational', lastService: '2023-04-20' },
  { id: '5', name: 'Access Control System', category: 'Security', status: 'Operational', lastService: '2023-03-05' },
];

const SitesManagement = ({
  portalType,
  onImportClick
}: SitesManagementProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [isEditSiteOpen, setIsEditSiteOpen] = useState(false);
  const [isImportSitesOpen, setIsImportSitesOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [equipmentBySite, setEquipmentBySite] = useState<Record<string, Equipment[]>>({});

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchEquipment = async () => {
    try {
      const { data, error } = await supabase
        .from('equipment')
        .select('*');
        
      if (error) {
        console.error('Error fetching equipment:', error);
        return {};
      }
      
      // Group equipment by site_id
      const equipmentMap: Record<string, Equipment[]> = {};
      data.forEach((item: Equipment) => {
        if (item.site_id) {
          if (!equipmentMap[item.site_id]) {
            equipmentMap[item.site_id] = [];
          }
          equipmentMap[item.site_id].push(item);
        }
      });
      
      return equipmentMap;
    } catch (err) {
      console.error('Error in fetchEquipment:', err);
      return {};
    }
  };

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      
      // Fetch equipment data first
      const equipmentData = await fetchEquipment();
      setEquipmentBySite(equipmentData);
      
      // Fetch sites
      const { data, error } = await supabase
        .from('business_sites')
        .select('*');
        
      if (error) {
        toast.error('Failed to load sites: ' + error.message);
        return;
      }
      
      const mappedSites: Site[] = data.map(site => {
        // Map equipment for this site
        const siteEquipment = equipmentData[site.id] || [];
        
        // Convert equipment data to SiteEquipment format
        const formattedEquipment: SiteEquipment[] = siteEquipment.map(equipment => ({
          id: equipment.id,
          name: equipment.name,
          category: 'Equipment', // You may want to add a category field to your equipment table
          status: equipment.status || 'Unknown',
        }));
        
        return {
          id: site.id,
          name: site.name,
          address: site.address,
          itemCount: siteEquipment.length, // Use the actual count from database
          complianceStatus: site.compliance_status as ComplianceStatus || 'pending',
          assignedContractors: [],
          coordinates: site.coordinates || undefined,
          site_type: site.site_type,
          contact_email: site.contact_email,
          contact_phone: site.contact_phone,
          notes: site.notes,
          equipment: formattedEquipment
        };
      });
      
      setSites(mappedSites);
    } catch (err) {
      console.error('Error fetching sites:', err);
      toast.error('An error occurred while loading sites');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSites = sites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         site.address.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (site.assignedContractors && site.assignedContractors.some(contractor => 
                             contractor.toLowerCase().includes(searchQuery.toLowerCase())));

    const matchesStatus = filterStatus ? site.complianceStatus === filterStatus : true;
    return matchesSearch && matchesStatus;
  });

  const handleEditSite = (site: Site) => {
    setSelectedSite(site);
    setIsEditSiteOpen(true);
  };

  const handleDeleteSite = async (siteId: string) => {
    try {
      const { error } = await supabase
        .from('business_sites')
        .delete()
        .eq('id', siteId);
        
      if (error) {
        toast.error(`Failed to delete site: ${error.message}`);
        return;
      }
      
      setSites(prev => prev.filter(site => site.id !== siteId));
      toast.success(`Site has been deleted`);
    } catch (err) {
      console.error('Error deleting site:', err);
      toast.error('An error occurred while deleting the site');
    }
  };

  const handleAddSite = () => {
    setSelectedSite(null);
    setIsAddSiteOpen(true);
  };

  const handleAddSiteSuccess = () => {
    setIsAddSiteOpen(false);
    fetchSites();
    toast.success('Site added successfully');
  };

  const handleEditSiteSuccess = () => {
    setIsEditSiteOpen(false);
    fetchSites();
    toast.success('Site updated successfully');
  };

  const handleImportSites = () => {
    if (onImportClick) {
      onImportClick();
    } else {
      setIsImportSitesOpen(true);
    }
  };

  const handleImportSuccess = () => {
    setIsImportSitesOpen(false);
    fetchSites();
  };

  return (
    <div>
      <div className="rounded-lg border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-forgemate-dark">Site Directory</h2>
              <p className="text-gray-500 mt-1">Manage your business site locations</p>
            </div>
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
          
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10 w-full" 
                placeholder="Search sites..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge 
                className={`cursor-pointer ${filterStatus === null ? 'bg-orange-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setFilterStatus(null)}
              >
                All
              </Badge>
              <Badge 
                className={`cursor-pointer ${filterStatus === 'compliant' ? 'bg-green-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setFilterStatus('compliant')}
              >
                Compliant
              </Badge>
              <Badge 
                className={`cursor-pointer ${filterStatus === 'warning' ? 'bg-yellow-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setFilterStatus('warning')}
              >
                Warning
              </Badge>
              <Badge 
                className={`cursor-pointer ${filterStatus === 'non-compliant' ? 'bg-red-500' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
                onClick={() => setFilterStatus('non-compliant')}
              >
                Non-Compliant
              </Badge>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <SitesTable sites={filteredSites} onEdit={handleEditSite} onDelete={handleDeleteSite} />
        )}
      </div>

      {/* Add Site Dialog */}
      <Dialog open={isAddSiteOpen} onOpenChange={setIsAddSiteOpen}>
        <DialogContent className="sm:max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Add New Site</h2>
          <AddEditSiteForm 
            onSuccess={handleAddSiteSuccess} 
            onCancel={() => setIsAddSiteOpen(false)} 
          />
        </DialogContent>
      </Dialog>

      {/* Edit Site Dialog */}
      <Dialog open={isEditSiteOpen} onOpenChange={setIsEditSiteOpen}>
        <DialogContent className="sm:max-w-2xl">
          <h2 className="text-2xl font-semibold mb-4">Edit Site</h2>
          {selectedSite && (
            <AddEditSiteForm 
              site={selectedSite}
              onSuccess={handleEditSiteSuccess} 
              onCancel={() => setIsEditSiteOpen(false)} 
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Import Sites Dialog */}
      <Dialog open={isImportSitesOpen} onOpenChange={setIsImportSitesOpen}>
        <SiteImportModal
          onClose={() => setIsImportSitesOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default SitesManagement;
