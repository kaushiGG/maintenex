import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AssetList from './AssetList';
import AssetDetails from './AssetDetails';
import QRCodeGenerator from './QRCodeGenerator';
import AssetServicing from './AssetServicing';
import { PlusCircle, QrCode, Wrench, History, Clock, MapPin, AlertTriangle, Package as PackageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/asset';
import { Input } from '@/components/ui/input';
import { QRCodeScannerDialog } from '../services/rcd-testing/QRCodeScannerDialog';
import { toast } from 'sonner';
import MissingEquipmentReport from './MissingEquipmentReport';
import { mockAssets } from '@/data/mockAssets';

interface AssetManagementDashboardProps {
  portalType: 'business' | 'contractor';
}

const AssetManagementDashboard = ({ portalType }: AssetManagementDashboardProps) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [assets] = useState<Asset[]>(mockAssets); // Use mockAssets for now

  const handleAssetSelect = (asset: Asset) => {
    setSelectedAsset(asset);
    setActiveTab('details');
  };

  const handleAddAsset = () => {
    // This would open a modal or navigate to add asset page in a real implementation
    toast.info('Add asset functionality will be implemented in future updates');
  };

  const handleQRScan = (data: string) => {
    // In a real app, this would look up the asset by QR code data
    toast.success(`QR code scanned: ${data}`);
    setSearchQuery(data);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Asset Management</h1>
        <div className="flex flex-wrap gap-2">
          <QRCodeScannerDialog onScan={handleQRScan} />
          <Button onClick={handleAddAsset}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Asset Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                <AssetList 
                  onAssetSelect={handleAssetSelect} 
                  searchQuery={searchQuery}
                  assets={assets}
                  isLoading={false}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="details">
                <Wrench className="mr-2 h-4 w-4" />
                Asset Details
              </TabsTrigger>
              <TabsTrigger value="qrcode">
                <QrCode className="mr-2 h-4 w-4" />
                QR Codes
              </TabsTrigger>
              <TabsTrigger value="history">
                <History className="mr-2 h-4 w-4" />
                Service History
              </TabsTrigger>
              <TabsTrigger value="schedule">
                <Clock className="mr-2 h-4 w-4" />
                Service Schedule
              </TabsTrigger>
              <TabsTrigger value="missing">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Missing Items
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              {selectedAsset ? (
                <AssetDetails asset={selectedAsset} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Select an asset to view details
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="qrcode">
              {selectedAsset ? (
                <QRCodeGenerator asset={selectedAsset} />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Select an asset to generate QR code
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="history">
              {selectedAsset ? (
                <AssetServicing 
                  asset={selectedAsset}
                  type="history"
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Select an asset to view service history
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="schedule">
              {selectedAsset ? (
                <AssetServicing
                  asset={selectedAsset}
                  type="schedule"
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">
                      Select an asset to view service schedule
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="missing">
              <MissingEquipmentReport portalType={portalType} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementDashboard;
