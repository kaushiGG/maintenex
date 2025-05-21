import React from 'react';
import { Clock, Check, AlertTriangle, Wrench } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ThermalImageItem } from './types';
import { ThermalItemDetails } from './ThermalItemDetails';

interface PreventativeTabProps {
  items: ThermalImageItem[];
}

export const PreventativeTab = ({ items }: PreventativeTabProps) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <Wrench className="h-12 w-12 mx-auto text-blue-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Preventative Maintenance Scans Found</h3>
        <p className="text-gray-500 mb-4">
          No preventative maintenance thermal scans have been recorded for this site yet.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create First Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Preventative Maintenance Scan</DialogTitle>
            </DialogHeader>
            <ThermalItemDetails isNew={true} type="preventative" />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Preventative Maintenance Records</h3>
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Maintenance</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{item.name}</span>
                {item.status === 'passed' ? (
                  <Badge className="bg-green-100 text-green-700">
                    <Check className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-700">
                    <Wrench className="h-3 w-3 mr-1" />
                    Maintenance Needed
                  </Badge>
                )}
              </CardTitle>
              <div className="text-sm text-gray-500">
                {item.location}
              </div>
            </CardHeader>
            
            <CardContent className="pb-2">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-gray-400" />
                  <span>Last scan: {new Date(item.lastScanned).toLocaleDateString()}</span>
                </div>
                <div>
                  <Badge variant="outline" className="text-blue-700 border-blue-200">
                    {item.readings.length} images
                  </Badge>
                </div>
              </div>
            </CardContent>
            
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">View Details</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[700px]">
                  <DialogHeader>
                    <DialogTitle>Thermal Analysis: {item.name}</DialogTitle>
                  </DialogHeader>
                  <ThermalItemDetails item={item} />
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
