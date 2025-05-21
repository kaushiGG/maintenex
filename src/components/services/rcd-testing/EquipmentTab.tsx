
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Tag } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { QRCodeScannerDialog } from './QRCodeScannerDialog';
import { StatusBadge } from './StatusBadge';

interface RCDEquipment {
  id: number;
  name: string;
  location: string;
  lastTest: string;
  status: string;
  compliance: string;
  nextTest: string;
}

interface EquipmentTabProps {
  isConnected: boolean;
  equipmentData: RCDEquipment[];
  onQRScan: (data: string) => void;
}

const EquipmentTab: React.FC<EquipmentTabProps> = ({ isConnected, equipmentData, onQRScan }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">RCD Equipment Details</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search RCDs..."
              className="pl-9 w-full"
            />
          </div>
          <QRCodeScannerDialog onScan={onQRScan} />
          <Button variant="outline" className="gap-1">
            <Tag className="h-4 w-4" />
            New Test
          </Button>
        </div>
      </div>

      {isConnected ? (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>RCD Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Last Test Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Next Test</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {equipmentData.map(item => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>{item.lastTest}</TableCell>
                  <TableCell>
                    <StatusBadge status={item.status} />
                  </TableCell>
                  <TableCell>{item.compliance}</TableCell>
                  <TableCell>{item.nextTest}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Card className="bg-gray-50">
          <CardContent className="p-12 text-center">
            <p className="text-gray-500">Connect to a test device to start managing RCD equipment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EquipmentTab;
