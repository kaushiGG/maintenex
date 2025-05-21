
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { PlumbingAppliance, getComplianceHistory } from './mockData';

interface ApplianceDetailsDialogProps {
  appliance: PlumbingAppliance;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ApplianceDetailsDialog: React.FC<ApplianceDetailsDialogProps> = ({
  appliance,
  open,
  onOpenChange,
}) => {
  const complianceHistory = appliance.type === 'Backflow Valve' 
    ? getComplianceHistory(appliance.id) 
    : [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Non-Compliant':
        return 'bg-red-100 text-red-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{appliance.name}</DialogTitle>
          <DialogDescription>
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appliance.status)}`}>
              {appliance.status}
            </span>
            <span className="ml-2 text-gray-500">{appliance.type}</span>
            <span className="ml-2 text-gray-500">•</span>
            <span className="ml-2 text-gray-500">{appliance.location}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Appliance Details</h3>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Serial Number</span>
                  <span className="text-sm">{appliance.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Manufacturer</span>
                  <span className="text-sm">{appliance.manufacturer || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Model</span>
                  <span className="text-sm">{appliance.model || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Install Date</span>
                  <span className="text-sm">{new Date(appliance.installationDate).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Inspection Information</h3>
            <Card>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Last Inspection</span>
                  <span className="text-sm">{new Date(appliance.lastInspection).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Next Inspection</span>
                  <span className="text-sm">{new Date(appliance.nextInspection).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Status</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(appliance.status)}`}>
                    {appliance.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Notes</span>
                  <span className="text-sm">{appliance.notes || 'No notes'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {appliance.type === 'Backflow Valve' && complianceHistory.length > 0 && (
          <>
            <Separator className="my-4" />
            <h3 className="text-sm font-medium text-gray-500 mb-2">Compliance History</h3>
            <div className="space-y-4">
              {complianceHistory.map((record) => (
                <Card key={record.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Certificate #{record.certificateNumber}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(record.complianceDate).toLocaleDateString()} - 
                        {new Date(record.expiryDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-xs text-gray-500">Test Result</span>
                        <p className="text-sm font-medium">
                          <span className={`px-2 py-0.5 rounded-full text-xs ${record.testResult === 'Pass' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {record.testResult}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Test Pressure</span>
                        <p className="text-sm">{record.testPressure}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Inspector</span>
                        <p className="text-sm">{record.inspector}</p>
                      </div>
                    </div>
                    {record.notes && (
                      <div className="mt-2">
                        <span className="text-xs text-gray-500">Notes</span>
                        <p className="text-sm">{record.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ApplianceDetailsDialog;
