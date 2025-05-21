
import React, { useState } from 'react';
import { Clock, Check, AlertTriangle, FileText, Download, ArrowRight, Printer, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ThermalImageItem, ThermalReading } from './types';
import { ThermalItemDetails } from './ThermalItemDetails';
import { useToast } from '@/hooks/use-toast';

interface SwitchboardTabProps {
  items: ThermalImageItem[];
}

export const SwitchboardTab = ({ items }: SwitchboardTabProps) => {
  const [selectedItem, setSelectedItem] = useState<ThermalImageItem | null>(null);
  const [selectedSwitchboard, setSelectedSwitchboard] = useState<string | null>("main");
  const [showVisualization, setShowVisualization] = useState(items.length > 0);
  const { toast } = useToast();
  
  const handleScheduleRepair = () => {
    toast({
      title: "Repair Scheduled",
      description: `Urgent repair has been scheduled for ${selectedItem?.name}`,
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Thermal analysis report has been downloaded",
    });
  };

  const handleAddToMaintenance = () => {
    toast({
      title: "Added to Maintenance",
      description: "This item has been added to the maintenance schedule",
    });
  };

  const handleScheduleScan = () => {
    toast({
      title: "Scan Scheduled",
      description: "A new thermal imaging scan has been scheduled",
    });
  };

  const handleUrgentAction = () => {
    toast({
      title: "Urgent Action Initiated",
      description: "Emergency service request has been sent",
    });
  };

  const getDummyHotspots = (item: ThermalImageItem) => {
    // Generate dummy hotspots based on item status
    if (item.status === 'failed') {
      return [
        {
          id: '1',
          circuitId: '3',
          temperature: 82,
          x: 35,
          y: 45,
          status: 'critical' as const,
          description: 'Possible loose connection'
        },
        {
          id: '2',
          circuitId: '12',
          temperature: 76,
          x: 65,
          y: 30,
          status: 'critical' as const,
          description: 'Load imbalance detected'
        },
        {
          id: '3',
          circuitId: '21',
          temperature: 65,
          x: 50,
          y: 65,
          status: 'warning' as const,
          description: 'Monitor for further increase'
        }
      ];
    }
    
    return [
      {
        id: '1',
        circuitId: '08',
        temperature: 42,
        x: 50,
        y: 60,
        status: 'normal' as const,
        description: 'Operating within normal parameters'
      }
    ];
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-10">
        <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
        <h3 className="text-xl font-medium mb-2">No Switchboard Scans Found</h3>
        <p className="text-gray-500 mb-4">
          No switchboard thermal scans have been recorded for this site yet.
        </p>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              Create First Scan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>New Switchboard Thermal Scan</DialogTitle>
            </DialogHeader>
            <ThermalItemDetails isNew={true} type="switchboard" />
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  // Get the first item for demonstration
  const currentItem = selectedItem || items[0];
  const hotspots = getDummyHotspots(currentItem);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div></div>
        <div className="flex items-center gap-4 ml-auto">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Last Scanned:</span>
            <span className="font-medium">28 Feb 2025</span>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleScheduleScan}>
            Schedule Scan
          </Button>
        </div>
      </div>
      
      <Card className="border-l-4 border-l-red-500">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-lg font-semibold flex items-center mb-2">
                Insurance Compliance Status
              </h3>
              <Badge className="bg-red-100 text-red-600 px-3 py-1 rounded-full">
                Overdue
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-sm text-gray-600 w-36">Required Frequency:</span>
                <span>Annual</span>
              </div>
              <div className="flex items-start">
                <span className="text-sm text-gray-600 w-36">Next Due Date:</span>
                <span className="text-red-500">Overdue (28 Feb 2025)</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="text-sm text-gray-600 w-36">Assigned Contractor:</span>
                <span>ElectroCare Services</span>
              </div>
              <div className="flex items-start justify-between">
                <div className="flex items-start">
                  <span className="text-sm text-gray-600 w-36">Insurance Document:</span>
                  <Button variant="outline" size="sm" className="h-7">
                    View PDF
                  </Button>
                </div>
                <Button className="bg-red-500 hover:bg-red-600 ml-auto" onClick={handleUrgentAction}>
                  Urgent Action
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <h3 className="text-lg font-medium mb-3">Switchboard Thermal Images</h3>
          <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
            <Button 
              variant={selectedSwitchboard === "main" ? "default" : "outline"} 
              onClick={() => setSelectedSwitchboard("main")}
              className={selectedSwitchboard === "main" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Main Switchboard
            </Button>
            <Button 
              variant={selectedSwitchboard === "floor1" ? "default" : "outline"} 
              onClick={() => setSelectedSwitchboard("floor1")}
              className={selectedSwitchboard === "floor1" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Floor 1 DB
            </Button>
            <Button 
              variant={selectedSwitchboard === "floor2" ? "default" : "outline"} 
              onClick={() => setSelectedSwitchboard("floor2")}
              className={selectedSwitchboard === "floor2" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Floor 2 DB
            </Button>
            <Button 
              variant={selectedSwitchboard === "server" ? "default" : "outline"} 
              onClick={() => setSelectedSwitchboard("server")}
              className={selectedSwitchboard === "server" ? "bg-blue-600 hover:bg-blue-700" : ""}
            >
              Server Room
            </Button>
          </div>
          
          <div className="relative border rounded-md overflow-hidden bg-gray-900">
            <img 
              src="/placeholder.svg" 
              alt="Thermal imaging scan" 
              className="w-full h-auto object-cover"
            />
            
            <div className="absolute top-4 right-4 bg-black bg-opacity-70 px-3 py-1 rounded text-white text-sm">
              <div className="flex flex-col items-end">
                <span>120°C</span>
                <div className="w-4 h-32 my-1 rounded-sm bg-gradient-to-b from-red-500 via-yellow-500 to-green-500"></div>
                <span>20°C</span>
              </div>
            </div>
            
            {/* Hotspots would be positioned here */}
            <div
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white bg-red-500"
              style={{ left: '35%', top: '45%', transform: 'translate(-50%, -50%)' }}
            >
              !
            </div>
            <div
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white bg-red-500"
              style={{ left: '65%', top: '30%', transform: 'translate(-50%, -50%)' }}
            >
              !
            </div>
            <div
              className="absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white bg-amber-500"
              style={{ left: '50%', top: '65%', transform: 'translate(-50%, -50%)' }}
            >
              !
            </div>
          </div>
          
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
            <Button variant="outline" size="sm">
              Zoom In
            </Button>
            <Button variant="outline" size="sm">
              Zoom Out
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-3">Thermal Analysis</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-sm text-gray-600 block">View Historical Data:</span>
                <Select defaultValue="feb-28-2025">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="feb-28-2025">Feb 28, 2025</SelectItem>
                    <SelectItem value="jan-15-2025">Jan 15, 2025</SelectItem>
                    <SelectItem value="nov-10-2024">Nov 10, 2024</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Compare
              </Button>
            </div>
            
            <Card className="bg-red-100 border-0">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">3 Issues Detected</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Circuit #3 - Overheating (82°C)</p>
                      <p className="text-sm text-gray-600">Possible loose connection</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-red-500" />
                    <div>
                      <p className="font-medium">Circuit #12 - Hot spot (76°C)</p>
                      <p className="text-sm text-gray-600">Load imbalance detected</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="mt-1.5 w-3 h-3 rounded-full bg-amber-500" />
                    <div>
                      <p className="font-medium">Circuit #21 - Warning (65°C)</p>
                      <p className="text-sm text-gray-600"></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <h3 className="text-lg font-medium mb-2">Recommended Actions</h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleScheduleRepair}
                >
                  Schedule Urgent Repair
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-between"
                  onClick={handleDownloadReport}
                >
                  Download Full Report
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full border-dashed border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600 mt-4"
                onClick={handleAddToMaintenance}
              >
                Add to Maintenance Schedule
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
