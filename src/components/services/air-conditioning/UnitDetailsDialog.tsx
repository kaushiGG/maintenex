
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Fan, Image, Wrench, ScrollText, Filter, Upload, Plus } from 'lucide-react';
import { ACUnit, getServiceReportsForUnit } from './mockData';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";

interface UnitDetailsDialogProps {
  unit: ACUnit;
}

const UnitDetailsDialog: React.FC<UnitDetailsDialogProps> = ({ unit }) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { toast } = useToast();
  
  const serviceReports = getServiceReportsForUnit(unit.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800';
      case 'Needs Service':
        return 'bg-red-100 text-red-800';
      case 'Filter Due':
        return 'bg-amber-100 text-amber-800';
      case 'Under Repair':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleScheduleService = () => {
    toast({
      title: "Service Scheduled",
      description: `Maintenance scheduled for ${unit.name}`
    });
  };

  const handleReplaceFilter = () => {
    toast({
      title: "Filter Replacement",
      description: `Filter replacement logged for ${unit.name}`
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      toast({
        title: "Image Uploaded",
        description: "Photo has been added to this unit"
      });
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="outline" className="w-full">View Details</Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Fan className="h-5 w-5 text-cyan-700" />
              {unit.name}
            </DialogTitle>
            <DialogDescription>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(unit.status)}`}>
                {unit.status}
              </span>
              <span className="ml-2 text-gray-500">{unit.type}</span>
              <span className="ml-2 text-gray-500">•</span>
              <span className="ml-2 text-gray-500">{unit.location}</span>
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Unit Information</h3>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Model</span>
                        <span className="text-sm">{unit.model}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Serial Number</span>
                        <span className="text-sm">{unit.serialNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Manufacturer</span>
                        <span className="text-sm">{unit.manufacturer}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Capacity</span>
                        <span className="text-sm">{unit.capacity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Refrigerant</span>
                        <span className="text-sm">{unit.refrigerantType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Install Date</span>
                        <span className="text-sm">{new Date(unit.installationDate).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Maintenance Information</h3>
                  <Card>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Last Service</span>
                        <span className="text-sm">{new Date(unit.lastService).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Next Service</span>
                        <span className="text-sm">{new Date(unit.nextService).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Filter Last Replaced</span>
                        <span className="text-sm">{new Date(unit.filterLastReplaced).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Filter Due</span>
                        <span className="text-sm">{new Date(unit.filterDueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(unit.status)}`}>
                          {unit.status}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <Textarea 
                  value={unit.notes || ''} 
                  placeholder="No notes available"
                  readOnly
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleScheduleService}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Service
                </Button>
                <Button onClick={handleReplaceFilter}>
                  <Filter className="mr-2 h-4 w-4" />
                  Replace Filter
                </Button>
              </div>
            </TabsContent>
            
            {/* Maintenance Tab */}
            <TabsContent value="maintenance">
              <div className="space-y-4">
                <div className="bg-cyan-50 p-4 rounded-md border border-cyan-100">
                  <h3 className="text-md font-medium text-cyan-800 flex items-center gap-1 mb-2">
                    <Wrench className="h-4 w-4" />
                    Maintenance Schedule
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-cyan-700 mb-1">Next Regular Maintenance:</p>
                      <div className="flex items-center gap-1 font-medium">
                        <Calendar className="h-4 w-4 text-cyan-700" />
                        {new Date(unit.nextService).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-cyan-700 mb-1">Next Filter Replacement:</p>
                      <div className="flex items-center gap-1 font-medium">
                        <Filter className="h-4 w-4 text-cyan-700" />
                        {new Date(unit.filterDueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                <h3 className="text-sm font-medium text-gray-500 mb-2">Schedule Maintenance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Service Date</label>
                    <Input type="date" className="w-full" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-500 mb-1 block">Service Type</label>
                    <select className="w-full h-10 rounded-md border border-input bg-background px-3 py-2">
                      <option>General Maintenance</option>
                      <option>Filter Replacement</option>
                      <option>Repair</option>
                      <option>Inspection</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">Notes</label>
                  <Textarea placeholder="Add maintenance notes" className="min-h-[100px]" />
                </div>
                <div className="flex justify-end">
                  <Button>Schedule Service</Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Photos Tab */}
            <TabsContent value="photos">
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-md border-gray-300 p-6">
                  <div className="flex flex-col items-center justify-center">
                    <Image className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-500 mb-3 text-center">
                      Upload photos of the AC unit for maintenance records
                    </p>
                    <label>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageUpload}
                        multiple
                      />
                      <Button variant="outline" className="cursor-pointer">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Photos
                      </Button>
                    </label>
                  </div>
                </div>

                {unit.photos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No photos available for this unit</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {unit.photos.map((photo, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-md">
                        <img src={photo} alt={`AC Unit ${index + 1}`} className="w-full h-full object-cover rounded-md" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
            
            {/* Reports Tab */}
            <TabsContent value="reports">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-md font-medium">Service History</h3>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Plus className="h-4 w-4" />
                    New Report
                  </Button>
                </div>

                {serviceReports.length === 0 ? (
                  <div className="text-center py-8 border rounded-md">
                    <ScrollText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No service reports available for this unit</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {serviceReports.map((report) => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium flex items-center gap-1">
                                <ScrollText className="h-4 w-4 text-cyan-700" />
                                Report {report.id}
                              </p>
                              <p className="text-sm text-gray-500">
                                <Calendar className="h-3.5 w-3.5 inline mr-1" />
                                {new Date(report.date).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant={report.filterReplaced ? "default" : "outline"} className="bg-cyan-100 text-cyan-800 border-cyan-200">
                              {report.filterReplaced ? "Filter Replaced" : "No Filter Change"}
                            </Badge>
                          </div>
                          
                          <div className="text-sm">
                            <p className="font-medium mb-1">Work Performed:</p>
                            <ul className="list-disc list-inside mb-2 text-gray-700">
                              {report.workPerformed.map((work, index) => (
                                <li key={index}>{work}</li>
                              ))}
                            </ul>
                            
                            {report.issues && (
                              <>
                                <p className="font-medium mb-1">Issues Found:</p>
                                <p className="mb-2 text-gray-700">{report.issues}</p>
                              </>
                            )}
                            
                            {report.recommendations && (
                              <>
                                <p className="font-medium mb-1">Recommendations:</p>
                                <p className="text-gray-700">{report.recommendations}</p>
                              </>
                            )}
                          </div>
                          
                          <div className="mt-2 text-sm text-gray-500">
                            Technician: {report.technicianName}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnitDetailsDialog;
