import React, { useState } from 'react';
import { Calendar, Clock, Thermometer, FileText, User, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ThermalImageItem, ThermalReading } from './types';
import ThermalImagingVisualization from './ThermalImagingVisualization';
import { useToast } from '@/hooks/use-toast';

interface ThermalItemDetailsProps {
  item?: ThermalImageItem;
  isNew?: boolean;
  type?: 'switchboard' | 'preventative';
}

export const ThermalItemDetails = ({ item, isNew = false, type = 'switchboard' }: ThermalItemDetailsProps) => {
  const [activeTab, setActiveTab] = useState('information');
  const [selectedReading, setSelectedReading] = useState<ThermalReading | null>(null);
  const { toast } = useToast();
  
  const handleScheduleRepair = () => {
    toast({
      title: "Repair Scheduled",
      description: `Urgent repair has been scheduled for ${item?.name}`,
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
  
  if (isNew) {
    return (
      <div className="py-4">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">Equipment Name</label>
              <Input id="name" placeholder="Enter equipment name" />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">Location</label>
              <Input id="location" placeholder="Equipment location" />
            </div>
          </div>
          
          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
            <Textarea id="notes" placeholder="Additional notes" rows={3} />
          </div>
          
          <div>
            <label htmlFor="image" className="block text-sm font-medium mb-1">Upload Thermal Image</label>
            <Input id="image" type="file" accept="image/*" />
            <p className="mt-1 text-sm text-gray-500">
              Upload thermal images in JPG, PNG format
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="temperature" className="block text-sm font-medium mb-1">Temperature Reading</label>
              <Input id="temperature" type="number" placeholder="°C" />
            </div>
            <div>
              <label htmlFor="analyst" className="block text-sm font-medium mb-1">Analyst Name</label>
              <Input id="analyst" placeholder="Name of analyst" />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-2">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Scan</Button>
          </div>
        </form>
      </div>
    );
  }
  
  if (!item) return null;
  
  return (
    <div className="py-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{item.name}</h3>
          <p className="text-gray-500">{item.location}</p>
        </div>
        <Badge className={
          item.status === 'passed' 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }>
          {item.status === 'passed' 
            ? "Passed" 
            : "Issues Found"}
        </Badge>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="images">Thermal Images ({item.readings.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="information" className="pt-4">
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">EQUIPMENT DETAILS</h4>
              <Separator className="my-2" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Equipment Type</p>
                  <p className="font-medium capitalize">{item.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Last Scan Date</p>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span>{new Date(item.lastScanned).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {item.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">NOTES</h4>
                <Separator className="my-2" />
                <p className="text-sm">{item.notes}</p>
              </div>
            )}
            
            <div className="pt-4 flex justify-end">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Add New Scan
              </Button>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="images" className="pt-4">
          <div className="space-y-6">
            {selectedReading ? (
              <div className="space-y-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedReading(null)} 
                  className="mb-2 -ml-2"
                >
                  ← Back to all scans
                </Button>
                
                <ThermalImagingVisualization
                  imageUrl={selectedReading.imageUrl || "/placeholder.svg"}
                  hotspots={[
                    {
                      id: '1',
                      circuitId: '12',
                      temperature: 76,
                      x: 35,
                      y: 45,
                      status: 'critical',
                      description: 'Load imbalance detected'
                    },
                    {
                      id: '2',
                      circuitId: '21',
                      temperature: 65,
                      x: 65,
                      y: 30,
                      status: 'warning',
                      description: 'Monitor for further increase'
                    }
                  ]}
                  onScheduleRepair={handleScheduleRepair}
                  onDownloadReport={handleDownloadReport}
                  onAddToMaintenance={handleAddToMaintenance}
                />
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center mb-2">
                    <User className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">Analyzed by: {selectedReading.analyst}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                    <span className="text-sm">{new Date(selectedReading.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ) : (
              item.readings.map((reading) => (
                <div key={reading.id} className="border rounded-md p-4 hover:border-blue-200 hover:bg-blue-50 transition-colors cursor-pointer" onClick={() => setSelectedReading(reading)}>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="md:w-1/3">
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                        <img 
                          src={reading.imageUrl || "/placeholder.svg"} 
                          alt="Thermal image" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    <div className="md:w-2/3 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">{new Date(reading.date).toLocaleDateString()}</span>
                        </div>
                        <Badge variant="outline" className="text-blue-700 border-blue-200">
                          <Thermometer className="h-3 w-3 mr-1" />
                          {reading.temperature}°C
                        </Badge>
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-1">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm font-medium">Notes</span>
                        </div>
                        <p className="text-sm">{reading.notes}</p>
                      </div>
                      
                      <div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-gray-400" />
                          <span className="text-sm">Analyzed by: {reading.analyst}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
