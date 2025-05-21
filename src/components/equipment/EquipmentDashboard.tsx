import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, QrCode, ClipboardList, Calendar, Search, Plus, Settings, Filter, ArrowLeft, FileText, Upload, ShieldCheck } from 'lucide-react';
import QRCodeGenerator from '../assets/QRCodeGenerator';
import AssetDetails from '../assets/AssetDetails';
import AssetServicing from '../assets/AssetServicing';
import { Asset, AssetStatus, UploadedFile } from '@/types/asset';
import { Input } from '@/components/ui/input';
import AssetList from '../assets/AssetList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import AddEquipmentForm from './AddEquipmentForm';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { EquipmentAttachments } from './EquipmentAttachments';
import EquipmentSafetyChecks from './EquipmentSafetyChecks';
import EquipmentImportModal from './EquipmentImportModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { addSafetyChecksToEquipment } from '@/utils/equipmentMigrations';

interface EquipmentDashboardProps {
  portalType?: 'business' | 'contractor';
}

const EquipmentDashboard = ({ portalType = 'business' }: EquipmentDashboardProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [equipment, setEquipment] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ensure we redirect from service-schedule to service-history if selected
  useEffect(() => {
    if (activeTab === 'service-schedule') {
      setActiveTab('service-history');
    }
  }, [activeTab]);

  useEffect(() => {
    if (user) {
      initializeEquipment();
    }
  }, [user]);

  const initializeEquipment = async () => {
    try {
      setIsLoading(true);
      
      // Run the safety checks migration
      await addSafetyChecksToEquipment();
      
      // Fetch equipment data
      await fetchEquipment();
    } catch (error) {
      console.error('Error initializing equipment:', error);
      toast.error('Failed to initialize equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEquipment = async () => {
    try {
      setIsLoading(true);
      const { data: equipment, error } = await supabase
        .from('equipment')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to fetch equipment');
        return;
      }

      const mappedEquipment = equipment.map(mapEquipmentToAsset);
      setEquipment(mappedEquipment);

      // If we have equipment and no selected asset, select the first one
      if (mappedEquipment.length > 0 && (!selectedAsset || !selectedAsset.id)) {
        setSelectedAsset(mappedEquipment[0]);
      }
    } catch (error) {
      console.error('Error in fetchEquipment:', error);
      toast.error('Failed to fetch equipment');
    } finally {
      setIsLoading(false);
    }
  };

  const mapEquipmentToAsset = (equipment: any): Asset => {
    // Parse attachments if they exist
    let attachments: UploadedFile[] | null = null;
    if (equipment.attachments) {
      try {
        attachments = typeof equipment.attachments === 'string'
          ? JSON.parse(equipment.attachments)
          : equipment.attachments;
      } catch (error) {
        console.error('Error parsing attachments:', error);
        attachments = null;
      }
    }

    // Process notes and remove any QR code URLs
    let notes = null;
    if (equipment.notes !== null && equipment.notes !== undefined) {
      notes = String(equipment.notes);
      // Remove QR code URL lines
      notes = notes
        .split('\n')
        .filter(line => !line.includes('QR Code URL:'))
        .join('\n')
        .trim();
      
      // If notes is empty after cleaning, set to null
      if (notes === '') {
        notes = null;
      }
    }

    return {
      id: equipment.id,
      name: equipment.name,
      category: equipment.category,
      manufacturer: equipment.manufacturer,
      model: equipment.model,
      serialNumber: equipment.serial_number,
      location: equipment.location,
      status: equipment.status as AssetStatus,
      purchaseDate: equipment.purchase_date,
      warrantyExpiry: equipment.warranty_expiry,
      nextServiceDate: equipment.next_service_date,
      notes: notes,
      attachments: attachments,
      safety_frequency: equipment.safety_frequency,
      safety_instructions: equipment.safety_instructions,
      safety_officer: equipment.safety_officer,
      training_video_url: equipment.training_video_url,
      training_video_name: equipment.training_video_name,
      safety_manager_id: equipment.safety_manager_id,
      authorized_officers: equipment.authorized_officers
    };
  };

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleAddEquipment = () => {
    setIsAddEquipmentOpen(true);
  };

  const handleImportEquipment = () => {
    setIsImportOpen(true);
  };

  const handleSaveEquipment = async (newEquipment: Asset) => {
    try {
      // Convert Asset to database format
      const dbEquipment = {
        name: newEquipment.name,
        category: newEquipment.category,
        manufacturer: newEquipment.manufacturer,
        model: newEquipment.model,
        serial_number: newEquipment.serialNumber,
        location: newEquipment.location,
        status: newEquipment.status,
        purchase_date: newEquipment.purchaseDate,
        warranty_expiry: newEquipment.warrantyExpiry,
        next_service_date: newEquipment.nextServiceDate,
        notes: newEquipment.notes,
        attachments: JSON.stringify(newEquipment.attachments),
        safety_frequency: newEquipment.safety_frequency,
        safety_instructions: newEquipment.safety_instructions ? 
          (typeof newEquipment.safety_instructions === 'string' 
            ? newEquipment.safety_instructions 
            : JSON.stringify(newEquipment.safety_instructions)) 
          : null,
        safety_officer: newEquipment.safety_officer,
        training_video_url: newEquipment.training_video_url,
        training_video_name: newEquipment.training_video_name,
        safety_manager_id: newEquipment.safety_manager_id,
        authorized_officers: newEquipment.authorized_officers
      };

      // Insert as single object, not as array
      const { error } = await supabase
        .from('equipment')
        .insert(dbEquipment);

      if (error) throw error;

      setEquipment(prev => [...prev, newEquipment]);
      setIsAddEquipmentOpen(false);
      toast.success('Equipment added successfully');
    } catch (error) {
      console.error('Error adding equipment:', error);
      toast.error('Failed to add equipment');
    }
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    fetchEquipment();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-black">Equipment Management</h2>
        <Button 
          onClick={() => setIsAddEquipmentOpen(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Equipment
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600"></div>
        </div>
      ) : equipment.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-300 rounded-md">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-500">No equipment found</h3>
          <p className="text-sm text-gray-400 mt-1">Add your first equipment item to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-black">Equipment List</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search equipment..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <AssetList
                assets={equipment.map(mapEquipmentToAsset)}
                onAssetSelect={handleAssetSelect}
                searchQuery={searchQuery}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            {selectedAsset ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-orange-600">{selectedAsset.name}</CardTitle>
                  </CardHeader>
                </Card>
                
                <Tabs defaultValue="overview">
                  <TabsList className="grid grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="servicing">Servicing</TabsTrigger>
                    <TabsTrigger value="safety">Safety Checks</TabsTrigger>
                    <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                    <TabsTrigger value="attachments">Attachments</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview">
                    <Card>
                      <CardContent className="pt-6">
                        <AssetDetails asset={selectedAsset} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="servicing">
                    <Card>
                      <CardContent className="pt-6">
                        <AssetServicing 
                          asset={selectedAsset}
                          type="history"
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="safety">
                    <Card>
                      <CardContent className="pt-6">
                        <EquipmentSafetyChecks
                          equipmentId={selectedAsset.id}
                          initialData={{
                            safety_frequency: selectedAsset.safety_frequency,
                            safety_instructions: selectedAsset.safety_instructions,
                            safety_officer: selectedAsset.safety_officer,
                            training_video_url: selectedAsset.training_video_url,
                            training_video_name: selectedAsset.training_video_name,
                            safety_manager_id: selectedAsset.safety_manager_id,
                            authorized_officers: selectedAsset.authorized_officers
                          }}
                          onDataChange={() => fetchEquipment()}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="qrcode">
                    <Card>
                      <CardContent className="pt-6">
                        <QRCodeGenerator asset={selectedAsset} />
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="attachments">
                    <Card>
                      <CardContent className="pt-6">
                        <EquipmentAttachments 
                          equipmentId={selectedAsset.id}
                          initialAttachments={selectedAsset.attachments || []}
                          onAttachmentsChange={() => fetchEquipment()}
                        />
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mb-3" />
                  <h3 className="text-lg font-medium text-gray-500">No equipment selected</h3>
                  <p className="text-sm text-gray-400 mt-1">Select an equipment item to view details</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Dialogs for add/import */}
      {isAddEquipmentOpen && (
        <AddEquipmentForm 
          isOpen={isAddEquipmentOpen}
          onClose={() => setIsAddEquipmentOpen(false)}
          onSave={handleSaveEquipment}
        />
      )}
      
      <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Equipment</DialogTitle>
          </DialogHeader>
          <EquipmentImportModal 
            onClose={() => setIsImportOpen(false)}
            onSuccess={handleImportSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EquipmentDashboard;
