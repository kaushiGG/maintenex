
import React, { useState } from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface QRCodeScannerDialogProps {
  onScan: (data: string) => void;
}

export const QRCodeScannerDialog = ({ onScan }: QRCodeScannerDialogProps) => {
  const [scanning, setScanning] = useState(false);
  
  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      onScan('TAG-1-012');
    }, 2000);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="ml-2">
          <QrCode className="h-4 w-4 mr-2" />
          Scan QR
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Scan QR Code</DialogTitle>
        </DialogHeader>
        <div className="p-4 border-2 border-dashed rounded-md border-gray-300 flex flex-col items-center justify-center">
          {scanning ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 border-4 border-t-[#7851CA] border-gray-200 rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Scanning...</p>
            </div>
          ) : (
            <>
              <QrCode className="h-24 w-24 mb-4 text-gray-400" />
              <p className="text-sm text-gray-500 mb-4">Position a QR code within the scanner area</p>
              <Button onClick={simulateScan}>Simulate Scan</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
