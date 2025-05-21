import React, { useState, useEffect } from 'react';
import { InventoryFilters, fetchSiteEquipment, fetchEquipmentCategories } from '@/services/siteInventoryService';
import { EquipmentItem } from './types/equipment';
import InventoryHeader from './inventory/InventoryHeader';
import InventoryTable from './inventory/InventoryTable';
import FilterBar from './inventory/FilterBar';
import FloorPlanViewer from './floorplans/FloorPlanViewer';
import FloorPlanUpload from './floorplans/FloorPlanUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { PlusCircle, TableProperties, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Dialog } from '@/components/ui/dialog';
import EquipmentImportModal from '@/components/equipment/EquipmentImportModal';

interface SiteInventoryViewProps {
  viewType?: string;
  siteId?: string;
}

const SiteInventoryView: React.FC<SiteInventoryViewProps> = ({ viewType = 'inventory', siteId }) => {
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSite, setSelectedSite] = useState(siteId || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'floorplan' | 'upload'>('table');
  const [isImportOpen, setIsImportOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!selectedSite) return;
    
    loadEquipment();
  }, [selectedSite, searchQuery, statusFilter, categoryFilter]);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  const loadEquipment = async () => {
    try {
      setIsLoading(true);
      
      const filters: InventoryFilters = {
        siteId: selectedSite,
        searchQuery,
        statusFilter: statusFilter !== 'all' ? statusFilter : undefined,
        categoryFilter: categoryFilter !== 'all' ? categoryFilter : undefined
      };
      
      const data = await fetchSiteEquipment(filters);
      setEquipment(data);
    } catch (error) {
      console.error("Failed to load equipment inventory:", error);
      toast.error("Failed to load equipment inventory");
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadCategories = async () => {
    try {
      const categoryList = await fetchEquipmentCategories();
      setCategories(categoryList);
    } catch (error) {
      console.error("Failed to load equipment categories:", error);
    }
  };
  
  const handleAddEquipment = () => {
    navigate('/dashboard/equipment/add');
  };

  const handleImportEquipment = () => {
    setIsImportOpen(true);
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    loadEquipment();
  };

  const getSiteName = () => {
    return selectedSite ? "Selected Site" : "All Sites";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        {/* Commented out the duplicate 'Equipment Inventory' heading */}
        {/* <h3 className="text-xl font-semibold">Equipment Inventory</h3> */}
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="text-forgemate-orange hover:text-white hover:bg-forgemate-orange border-forgemate-orange"
            onClick={handleImportEquipment}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import Equipment
          </Button>
          <Button 
            onClick={handleAddEquipment}
            className="bg-forgemate-orange hover:bg-forgemate-orange/90"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Equipment
          </Button>
        </div>
      </div>
      
      <FilterBar
        selectedSite={selectedSite}
        setSelectedSite={setSelectedSite}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        categories={categories}
      />
      
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'table' | 'floorplan' | 'upload')}>
        <TabsList className="mb-4">
          <TabsTrigger value="table" className="flex items-center">
            <TableProperties className="h-4 w-4 mr-2" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="floorplan" className="flex items-center">
            <TableProperties className="h-4 w-4 mr-2" />
            Floor Plan View
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload Floor Plan
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="table">
          <Card>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
                </div>
              ) : (
                <InventoryTable equipment={equipment} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="floorplan">
          <Card>
            <CardContent className="p-4">
              <FloorPlanViewer />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="p-4">
              <FloorPlanUpload />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <EquipmentImportModal
          onClose={() => setIsImportOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default SiteInventoryView;
