
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Lightbulb, 
  Map, 
  Calendar, 
  ClipboardList, 
  BookOpen,
  PlusCircle,
  Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SiteInfoCard from '../rcd-testing/SiteInfoCard';

const EmergencyExitLightingService = () => {
  const [searchParams] = useSearchParams();
  const siteId = searchParams.get('siteId');
  const siteName = searchParams.get('siteName');
  const siteAddress = searchParams.get('siteAddress');
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('map');
  const [showAddLightDialog, setShowAddLightDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data for emergency lights
  const emergencyLights = [
    { id: 1, location: 'Main Entrance', type: 'Exit Sign', brand: 'Eaton', lastTested: '2023-12-15', nextTest: '2024-06-15', status: 'Passed' },
    { id: 2, location: 'Corridor A', type: 'Emergency Light', brand: 'Legrand', lastTested: '2023-12-15', nextTest: '2024-06-15', status: 'Passed' },
    { id: 3, location: 'Stairwell B', type: 'Exit Sign', brand: 'Philips', lastTested: '2023-12-20', nextTest: '2024-06-20', status: 'Failed' },
    { id: 4, location: 'Office Area', type: 'Emergency Light', brand: 'Schneider', lastTested: '2024-01-05', nextTest: '2024-07-05', status: 'Passed' },
    { id: 5, location: 'Kitchen', type: 'Exit Sign', brand: 'Eaton', lastTested: '2024-01-10', nextTest: '2024-07-10', status: 'Needs Attention' },
  ];

  const filteredLights = emergencyLights.filter(light => 
    light.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    light.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    light.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate testing compliance
  const nextTestDate = new Date();
  nextTestDate.setMonth(nextTestDate.getMonth() + 6);
  const formattedNextDate = nextTestDate.toISOString().split('T')[0];

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  // Fix: Opening the add light dialog
  const openAddLightDialog = () => {
    setShowAddLightDialog(true);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center pt-6 pb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Lightbulb className="h-6 w-6 text-yellow-500 mr-2" />
            Emergency & Exit Lighting Service
          </h1>
        </div>

        <SiteInfoCard siteName={siteName} siteAddress={siteAddress} />

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold">Six-Month Testing Requirements</h2>
                <p className="text-gray-500 text-sm">Next scheduled test date: {formatDate(formattedNextDate)}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Test
                </Button>
                <Button className="flex items-center">
                  <ClipboardList className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search lights by location, type, or brand..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {/* Fix: Changed DialogTrigger to regular Button */}
          <Button className="ml-4" onClick={openAddLightDialog}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Light
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="map" className="flex items-center">
              <Map className="h-4 w-4 mr-2" />
              Site Map
            </TabsTrigger>
            <TabsTrigger value="inventory" className="flex items-center">
              <Lightbulb className="h-4 w-4 mr-2" />
              Light Inventory
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Test Records
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="p-0">
            <Card>
              <CardContent className="p-6">
                <div className="bg-gray-100 rounded-lg h-[400px] flex items-center justify-center border border-dashed border-gray-300">
                  <div className="text-center p-4">
                    <Map className="h-16 w-16 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium text-gray-900">Site Map View</h3>
                    <p className="text-gray-500 mt-1 max-w-md">
                      A map showing the locations of all emergency and exit lights would appear here.
                      Upload a floor plan to visualize light placements.
                    </p>
                    <Button className="mt-4">Upload Floor Plan</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="p-0">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead>Last Test</TableHead>
                        <TableHead>Next Test</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLights.length > 0 ? (
                        filteredLights.map((light) => (
                          <TableRow key={light.id}>
                            <TableCell className="font-medium">{light.id}</TableCell>
                            <TableCell>{light.location}</TableCell>
                            <TableCell>{light.type}</TableCell>
                            <TableCell>{light.brand}</TableCell>
                            <TableCell>{formatDate(light.lastTested)}</TableCell>
                            <TableCell>{formatDate(light.nextTest)}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                light.status === 'Passed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : light.status === 'Failed' 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {light.status}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">View</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                            No lights found. Add your first emergency or exit light.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="records" className="p-0">
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <BookOpen className="h-5 w-5 mr-2 text-purple-600" />
                      On-site Records Book
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Emergency lighting testing records must be kept on-site. 
                      Generate a printable record book for site compliance.
                    </p>
                    <Button className="w-full">Generate Book for Printing</Button>
                  </div>
                  
                  <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-purple-600" />
                      Testing History
                    </h3>
                    <p className="text-gray-600 mb-4">
                      View all historical test results and compliance records.
                      Export data for reporting and auditing purposes.
                    </p>
                    <Button variant="outline" className="w-full">Export Test History</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Fix: Dialog properly implemented with open state */}
      <Dialog open={showAddLightDialog} onOpenChange={setShowAddLightDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add New Emergency Light</DialogTitle>
            <DialogDescription>
              Enter the details of the emergency or exit light to add it to the inventory.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="light-location" className="text-right font-medium text-sm">
                Location
              </label>
              <Input
                id="light-location"
                placeholder="e.g., Main Entrance"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="light-type" className="text-right font-medium text-sm">
                Type
              </label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select light type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="exit-sign">Exit Sign</SelectItem>
                  <SelectItem value="emergency-light">Emergency Light</SelectItem>
                  <SelectItem value="combo">Combo Unit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="light-brand" className="text-right font-medium text-sm">
                Brand
              </label>
              <Input
                id="light-brand"
                placeholder="e.g., Eaton, Philips"
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="light-notes" className="text-right font-medium text-sm">
                Notes
              </label>
              <Textarea
                id="light-notes"
                placeholder="Additional notes about this light..."
                className="col-span-3"
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLightDialog(false)}>
              Cancel
            </Button>
            <Button type="submit" onClick={() => setShowAddLightDialog(false)}>
              Save Light
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmergencyExitLightingService;
