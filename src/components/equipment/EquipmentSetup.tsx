
import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  QrCode, 
  Calendar, 
  Bell, 
  FileText, 
  AlertTriangle, 
  Wrench, 
  CheckCircle,
  UserCheck,
  LogIn,
  LogOut as SignOut,
  Camera,
  FilePlus,
  PlusCircle,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Mock equipment data
const MOCK_EQUIPMENT = [
  { 
    id: 1, 
    name: 'Pressure Tester',
    location: 'Building A - Room 103',
    serialNumber: 'PT1029384',
    manufacturer: 'SafetyFirst Inc.',
    lastMaintenance: '2023-08-15',
    nextMaintenance: '2023-11-15',
    status: 'operational',
    image: 'https://placehold.co/300x200',
    description: 'Industrial pressure testing equipment for high-pressure systems.'
  },
  { 
    id: 2, 
    name: 'Air Quality Monitor',
    location: 'Building B - Room 210',
    serialNumber: 'AQM5678901',
    manufacturer: 'CleanAir Technologies',
    lastMaintenance: '2023-09-02',
    nextMaintenance: '2023-12-02',
    status: 'operational',
    image: 'https://placehold.co/300x200',
    description: 'Advanced monitoring system for air quality and contaminant detection.'
  },
  { 
    id: 3, 
    name: 'Emergency Generator',
    location: 'Building A - Basement',
    serialNumber: 'EG3456789',
    manufacturer: 'PowerSolutions Ltd.',
    lastMaintenance: '2023-07-20',
    nextMaintenance: '2023-10-20',
    status: 'maintenance_required',
    image: 'https://placehold.co/300x200',
    description: 'Backup power generator for emergency situations.'
  }
];

interface EquipmentSetupProps {
  onBackToDashboard: () => void;
}

const EquipmentSetup: React.FC<EquipmentSetupProps> = ({ onBackToDashboard }) => {
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('details');

  const handleEquipmentSelect = (equipment: any) => {
    setSelectedEquipment(equipment);
    setActiveTab('details');
  };

  const handleBackToList = () => {
    setSelectedEquipment(null);
  };

  const handleGenerateQRCode = () => {
    toast.success(`QR code generated for ${selectedEquipment.name}`);
  };

  const handleUploadMedia = () => {
    toast.info('Media upload feature initiated');
  };

  const handleUploadManual = () => {
    toast.info('Manual upload feature initiated');
  };

  const handleCheckInOut = (isCheckIn: boolean) => {
    toast.success(`${isCheckIn ? 'Checked in' : 'Checked out'} ${selectedEquipment.name}`);
  };

  const handleScheduleMaintenance = () => {
    toast.info('Maintenance scheduling initiated');
  };

  const handleAddSafetyCheck = () => {
    toast.info('Safety check recorded');
  };

  const handleLogTraining = () => {
    toast.info('Training record added');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-[calc(100vh-64px)]">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          {selectedEquipment ? (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={handleBackToList}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to list
            </Button>
          ) : (
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-2" 
              onClick={onBackToDashboard}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-800">
            {selectedEquipment ? selectedEquipment.name : 'Equipment Setup'}
          </h1>
        </div>
        
        {!selectedEquipment && (
          <Button 
            onClick={() => toast.info('Add new equipment feature initiated')}
            className="bg-[#7851CA] hover:bg-[#6742B0]"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Equipment
          </Button>
        )}
      </div>

      {selectedEquipment ? (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance Logs</TabsTrigger>
              <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
              <TabsTrigger value="usage">Usage Tracking</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Equipment Details</CardTitle>
                    <CardDescription>
                      Information and specifications about the equipment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Name</label>
                          <Input value={selectedEquipment.name} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Serial Number</label>
                          <Input value={selectedEquipment.serialNumber} readOnly />
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Location</label>
                        <Input value={selectedEquipment.location} readOnly />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Manufacturer</label>
                        <Input value={selectedEquipment.manufacturer} readOnly />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-700">Description</label>
                        <Textarea value={selectedEquipment.description} readOnly />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-gray-700">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            selectedEquipment.status === 'operational' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {selectedEquipment.status === 'operational' ? 'Operational' : 'Maintenance Required'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={handleGenerateQRCode}>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate QR Code
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleCheckInOut(true)}
                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                      >
                        <LogIn className="mr-2 h-4 w-4" />
                        Check In
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleCheckInOut(false)}
                        className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                      >
                        <SignOut className="mr-2 h-4 w-4" />
                        Check Out
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Media & Resources</CardTitle>
                    <CardDescription>
                      Upload and manage equipment images and resources
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border border-dashed border-gray-300 rounded-md p-4 text-center">
                        {selectedEquipment.image ? (
                          <img 
                            src={selectedEquipment.image} 
                            alt={selectedEquipment.name} 
                            className="mx-auto mb-2 rounded-md"
                          />
                        ) : (
                          <div className="py-8">
                            <Package className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-500">No images available</p>
                          </div>
                        )}
                        <Button variant="outline" className="mt-2" onClick={handleUploadMedia}>
                          <Camera className="mr-2 h-4 w-4" />
                          Upload Image
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="maintenance">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Records</CardTitle>
                  <CardDescription>
                    Track maintenance history and schedule future maintenance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Maintenance Schedule</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Maintenance</label>
                          <Input type="date" value={selectedEquipment.lastMaintenance} readOnly />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Next Maintenance</label>
                          <Input type="date" value={selectedEquipment.nextMaintenance} readOnly />
                        </div>
                      </div>
                      <Button className="mt-4 w-full bg-[#7851CA] hover:bg-[#6742B0]" onClick={handleScheduleMaintenance}>
                        <Calendar className="mr-2 h-4 w-4" />
                        Schedule Maintenance
                      </Button>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-2">Maintenance History</h3>
                      <div className="border rounded-md divide-y">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Routine Maintenance</p>
                              <p className="text-sm text-gray-500">Conducted by: John Smith</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-08-15</span>
                          </div>
                          <p className="mt-2 text-sm">Performed routine maintenance check. All systems operational.</p>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Calibration</p>
                              <p className="text-sm text-gray-500">Conducted by: Sarah Johnson</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-05-20</span>
                          </div>
                          <p className="mt-2 text-sm">Calibrated all sensors and measuring components.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="safety">
              <Card>
                <CardHeader>
                  <CardTitle>Safety & Compliance</CardTitle>
                  <CardDescription>
                    Safety checks, alerts, and compliance documentation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium">Safety Checks</h3>
                        <Button size="sm" onClick={handleAddSafetyCheck}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Add Check
                        </Button>
                      </div>
                      <div className="border rounded-md divide-y">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Safety Inspection</p>
                              <p className="text-sm text-gray-500">Conducted by: Emily Clark</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-09-10</span>
                          </div>
                          <p className="mt-2 text-sm">All safety features functioning correctly. No issues found.</p>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Compliance Check</p>
                              <p className="text-sm text-gray-500">Conducted by: Michael Brown</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-08-28</span>
                          </div>
                          <p className="mt-2 text-sm">Equipment meets all current regulatory requirements.</p>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Safety Alerts</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="border rounded-md p-4 bg-amber-50">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="font-medium text-amber-800">Maintenance Reminder</p>
                              <p className="text-sm text-amber-700 mt-1">
                                Regular maintenance is due in 2 weeks. Schedule service to ensure continued safe operation.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="usage">
              <Card>
                <CardHeader>
                  <CardTitle>Usage Tracking</CardTitle>
                  <CardDescription>
                    Track equipment usage and user logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">User Access Log</h3>
                      <div className="border rounded-md divide-y">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Thomas Wilson</p>
                              <p className="text-sm text-gray-500">Checked out for 3 hours</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-09-18 - 13:45</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Jessica Adams</p>
                              <p className="text-sm text-gray-500">Checked out for 2 hours</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-09-15 - 10:30</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Robert Chen</p>
                              <p className="text-sm text-gray-500">Checked out for 4 hours</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-09-12 - 09:15</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Training Records</h3>
                      <div className="border rounded-md divide-y">
                        <div className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium">Equipment Operation Training</p>
                              <p className="text-sm text-gray-500">5 users completed</p>
                            </div>
                            <span className="text-sm text-gray-500">2023-07-20</span>
                          </div>
                        </div>
                      </div>
                      <Button className="mt-4 w-full" variant="outline" onClick={handleLogTraining}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Log Training Session
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documentation">
              <Card>
                <CardHeader>
                  <CardTitle>Documentation</CardTitle>
                  <CardDescription>
                    Manuals, guides, and safety data sheets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Documents</h3>
                      <div className="border rounded-md divide-y">
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium">User Manual</p>
                              <p className="text-sm text-gray-500">PDF - 5.2 MB</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">Download</Button>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium">Safety Data Sheet</p>
                              <p className="text-sm text-gray-500">PDF - 2.8 MB</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">Download</Button>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="font-medium">Maintenance Guide</p>
                              <p className="text-sm text-gray-500">PDF - 3.4 MB</p>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">Download</Button>
                        </div>
                      </div>
                      <Button className="mt-4 w-full" variant="outline" onClick={handleUploadManual}>
                        <FilePlus className="mr-2 h-4 w-4" />
                        Upload Document
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_EQUIPMENT.map((equipment) => (
            <Card key={equipment.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleEquipmentSelect(equipment)}>
              <CardContent className="p-0">
                {equipment.image && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={equipment.image} 
                      alt={equipment.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-medium text-lg">{equipment.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{equipment.location}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      equipment.status === 'operational' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {equipment.status === 'operational' ? 'Operational' : 'Maintenance Required'}
                    </span>
                    <span className="text-xs text-gray-500">SN: {equipment.serialNumber}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipmentSetup;
