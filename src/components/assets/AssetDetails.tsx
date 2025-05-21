import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Package, HardDrive, Calendar, MapPin, Tag, 
  AlertTriangle, Clipboard, FileText, Pencil, 
  Loader2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Asset } from '@/types/asset';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import EditAssetDialog from './EditAssetDialog';

interface AssetDetailsProps {
  asset: Asset;
}

const AssetDetails = ({ asset }: AssetDetailsProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cleanedNotes, setCleanedNotes] = useState<string | null>(null);
  
  useEffect(() => {
    // Simulate loading delay to ensure component updates properly
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [asset]);

  useEffect(() => {
    // Clean QR code URLs from notes
    if (asset.notes) {
      // Remove any lines containing "QR Code URL: "
      const notesWithoutQRCode = asset.notes
        .split('\n')
        .filter(line => !line.includes('QR Code URL:'))
        .join('\n')
        .trim();
      
      setCleanedNotes(notesWithoutQRCode || null);
    } else {
      setCleanedNotes(null);
    }
  }, [asset.notes]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-orange-500 animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading equipment details...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{asset.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge 
              variant={asset.status === 'active' ? 'default' : 
                      asset.status === 'maintenance' ? 'destructive' : 
                      'secondary'}
            >
              {asset.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Asset Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">ID:</span>
                  <span className="text-sm">{asset.id}</span>
                </div>
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Category:</span>
                  <span className="text-sm">{asset.category}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Location:</span>
                  <span className="text-sm">{asset.location}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Specifications</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <HardDrive className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Manufacturer:</span>
                  <span className="text-sm">{asset.manufacturer}</span>
                </div>
                <div className="flex items-center">
                  <Clipboard className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Model:</span>
                  <span className="text-sm">{asset.model}</span>
                </div>
                <div className="flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Serial Number:</span>
                  <span className="text-sm">{asset.serialNumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Service Information</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Purchase Date:</span>
                  <span className="text-sm">{asset.purchaseDate}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Warranty Until:</span>
                  <span className="text-sm">{asset.warrantyExpiry}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium mr-2">Next Service Date:</span>
                  <span className="text-sm">{asset.nextServiceDate}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Notes</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => setIsEditDialogOpen(true)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit Notes
                </Button>
              </div>
              
              {cleanedNotes ? (
                <div className="bg-orange-50 p-3 rounded-md border border-orange-100">
                  <p className="text-sm whitespace-pre-wrap">{cleanedNotes}</p>
                </div>
              ) : (
                <div className="border border-dashed border-gray-200 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-400 italic">No notes available. Click Edit Notes to add information.</p>
                </div>
              )}
            </div>

            {asset.status === 'maintenance' && (
              <div className="bg-destructive/10 p-3 rounded-md border border-destructive/20">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-destructive" />
                  <span className="text-sm font-medium text-destructive">Maintenance Alert</span>
                </div>
                <p className="text-sm mt-1">This asset is currently under maintenance.</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Add the edit dialog component */}
      <EditAssetDialog 
        asset={asset} 
        isOpen={isEditDialogOpen} 
        onClose={() => setIsEditDialogOpen(false)} 
      />
    </Card>
  );
};

export default AssetDetails;
