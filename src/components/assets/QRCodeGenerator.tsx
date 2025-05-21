import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Asset } from '@/types/asset';
import { Package, Printer, Download, Check, QrCode, Image, Lock, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface QRCodeGeneratorProps {
  asset: Asset;
}

const QRCodeGenerator = ({ asset }: QRCodeGeneratorProps) => {
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generate a unique QR code data URL for the asset
  useEffect(() => {
    generateQRCodeData();
  }, [asset.id]);
  
  const generateQRCodeData = async () => {
    if (!asset?.id) return;
    
    setIsGenerating(true);
    
    try {
      // Create a unique identifier for the asset
      const assetIdentifier = `eq-${asset.id}`;
      
      // The QR code should contain a URL that could be used to access the asset details
      // For example: https://yourapp.com/equipment/scan/eq-12345
      // This would be the URL that someone scanning the QR code would be directed to
      const baseUrl = window.location.origin;
      const qrCodeUrl = `${baseUrl}/equipment/scan/${assetIdentifier}`;
      
      setQrCodeData(qrCodeUrl);
      
      // Update the asset in Supabase with the QR code URL in the notes field
      // since there's no dedicated qr_identifier field
      await updateAssetQRCode(qrCodeUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const updateAssetQRCode = async (qrCodeUrl: string) => {
    try {
      // We no longer store the QR code URL in the notes field
      // Just set the QR code data in the state
      // No database update needed for the notes field
      
      // The following code that modifies notes has been removed:
      // const currentNotes = asset.notes || '';
      // const updatedNotes = `${currentNotes}\n\nQR Code URL: ${qrCodeUrl}`;
      // 
      // const { error } = await supabase
      //   .from('equipment')
      //   .update({ notes: updatedNotes })
      //   .eq('id', asset.id);
        
      // if (error) {
      //   console.error("Error updating asset notes with QR code:", error);
      // }
    } catch (error) {
      console.error("Error in QR code generation:", error);
    }
  };

  // Simulate print operation
  const handlePrint = () => {
    if (!qrCodeData) {
      toast.error("QR code not generated yet");
      return;
    }
    
    setIsPrinting(true);
    setTimeout(() => {
      setIsPrinting(false);
      toast.success(`QR code for ${asset.name} sent to printer`);
    }, 1500);
  };

  // Simulate download operation
  const handleDownload = () => {
    if (!qrCodeData) {
      toast.error("QR code not generated yet");
      return;
    }
    
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      toast.success(`QR code for ${asset.name} downloaded`);
    }, 1500);
  };
  
  // Regenerate QR code
  const handleRegenerateQRCode = () => {
    generateQRCodeData();
    toast.info("Generating new QR code...");
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">QR Code Generator</h2>
        <p className="text-sm text-muted-foreground">
          Create and print QR code labels for asset tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20">
          <CardHeader className="pb-0">
            <CardTitle className="text-md flex items-center">
              <QrCode className="h-4 w-4 text-primary mr-2" />
              QR Code Preview
            </CardTitle>
            <CardDescription>
              This QR code links to asset {asset.id}
            </CardDescription>
            <div className="mt-4 mb-2">
              <Tabs value={selectedSize} onValueChange={(v) => setSelectedSize(v as 'small' | 'medium' | 'large')} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="small">Small</TabsTrigger>
                  <TabsTrigger value="medium">Medium</TabsTrigger>
                  <TabsTrigger value="large">Large</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            {isGenerating ? (
              <div className="flex flex-col items-center justify-center p-6">
                <div className="h-12 w-12 border-4 border-t-transparent border-primary rounded-full animate-spin mb-4"></div>
                <p className="text-sm text-muted-foreground">Generating QR code...</p>
              </div>
            ) : (
              <div className={`bg-white border-2 border-primary/20 rounded-md p-6 flex flex-col items-center ${
                selectedSize === 'small' ? 'w-36 h-36' : 
                selectedSize === 'medium' ? 'w-48 h-48' : 'w-64 h-64'
              }`}>
                <div className="text-center">
                  <div className="bg-black p-2 mb-3 rounded">
                    <QrCode 
                      className={`mx-auto mb-2 text-white ${
                        selectedSize === 'small' ? 'h-16 w-16' : 
                        selectedSize === 'medium' ? 'h-24 w-24' : 'h-32 w-32'
                      }`} 
                    />
                  </div>
                  <div className={`text-xs font-medium mt-1 ${selectedSize === 'large' ? 'text-sm' : ''}`}>
                    {asset.name}
                  </div>
                  <div className={`text-xs text-muted-foreground ${selectedSize === 'small' ? 'text-[10px]' : ''}`}>
                    ID: {asset.id?.substring(0, 8)}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center space-x-3 pt-0 pb-6">
            <Button 
              onClick={handlePrint} 
              variant="outline" 
              className="flex items-center"
              disabled={isPrinting || isGenerating || !qrCodeData}
            >
              {isPrinting ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                  Printing...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </>
              )}
            </Button>
            <Button 
              onClick={handleDownload} 
              variant="outline" 
              className="flex items-center"
              disabled={isDownloading || isGenerating || !qrCodeData}
            >
              {isDownloading ? (
                <>
                  <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              disabled={isGenerating || !qrCodeData}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <Package className="h-4 w-4 text-primary mr-2" />
                Asset Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1 text-muted-foreground">Asset ID</label>
                  <div className="text-sm p-2 bg-muted/50 rounded border">{asset.id}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1 text-muted-foreground">Asset Name</label>
                  <div className="text-sm p-2 bg-muted/50 rounded border">{asset.name}</div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-1 text-muted-foreground">Location</label>
                  <div className="text-sm p-2 bg-muted/50 rounded border">{asset.location}</div>
                </div>
                
                <Button 
                  className="w-full mt-4" 
                  variant="outline" 
                  onClick={handleRegenerateQRCode}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <div className="h-4 w-4 mr-2 border-2 border-t-transparent border-primary rounded-full animate-spin"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="h-4 w-4 mr-2" />
                      Regenerate QR Code
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start">
                <div className="mr-3 mt-1 bg-blue-100 p-1.5 rounded-full">
                  <Lock className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-700 mb-1">QR Code Security</h3>
                  <p className="text-xs text-blue-600">
                    When scanned, this QR code provides secure access to the asset's details, 
                    service history, and allows authorized technicians to log maintenance activities.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;
