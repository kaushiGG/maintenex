import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  QrCode, 
  Search, 
  PlusCircle, 
  Download, 
  Upload, 
  Calendar, 
  File, 
  FileText, 
  Image, 
  Tag,
  AlertTriangle,
  Thermometer,
  Flame,
  AirVent,
  Wrench,
  BugOff,
  ClipboardList,
  Zap,
  Check,
  X,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

// Mock data for sites
const mockSites = {
  '1': { id: '1', name: 'Brisbane Office', address: '123 Brisbane St, Brisbane QLD' },
  '2': { id: '2', name: 'Sydney Headquarters', address: '456 Sydney Rd, Sydney NSW' },
  '3': { id: '3', name: 'Melbourne Branch', address: '789 Melbourne Ave, Melbourne VIC' },
  '4': { id: '4', name: 'Perth Office', address: '321 Perth Blvd, Perth WA' },
  '5': { id: '5', name: 'Adelaide Center', address: '654 Adelaide Ln, Adelaide SA' },
  '6': { id: '6', name: 'Gold Coast Facility', address: '987 Gold Coast Hwy, Gold Coast QLD' }
};

// Service types
const serviceTypes = {
  'test-a-tag': { name: 'Testing Tags', icon: Tag, color: 'bg-blue-100 text-blue-600' },
  'rcd': { name: 'RCD Testing', icon: Zap, color: 'bg-yellow-100 text-yellow-600' },
  'emergency-exit': { name: 'Emergency & Exit', icon: AlertTriangle, color: 'bg-red-100 text-red-600' },
  'thermal-imaging': { name: 'Thermal Imaging', icon: Thermometer, color: 'bg-purple-100 text-purple-600' },
  'fire-services': { name: 'Fire Services', icon: Flame, color: 'bg-orange-100 text-orange-600' },
  'air-conditioning': { name: 'Air Conditioning', icon: AirVent, color: 'bg-cyan-100 text-cyan-600' },
  'lift-services': { name: 'Lift Services', icon: Wrench, color: 'bg-gray-100 text-gray-600' },
  'pest-control': { name: 'Pest Control', icon: BugOff, color: 'bg-green-100 text-green-600' },
  'cleaning': { name: 'Cleaning', icon: ClipboardList, color: 'bg-teal-100 text-teal-600' }
};

// Mock items for services
const generateMockItems = (siteId: string, serviceType: string) => {
  const items = [];
  const count = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 1; i <= count; i++) {
    const testResult = Math.random() > 0.2;
    items.push({
      id: `${siteId}-${serviceType}-${i}`,
      itemNumber: `${serviceType.substring(0, 3).toUpperCase()}-${siteId}-${i.toString().padStart(3, '0')}`,
      name: `${getItemName(serviceType)} ${i}`,
      location: `Level ${Math.floor(Math.random() * 5) + 1}, ${['Room', 'Office', 'Area', 'Zone'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 50) + 1}`,
      lastInspected: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
      nextInspection: new Date(Date.now() + Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)),
      status: testResult ? 'Passed' : 'Failed',
      description: `${getItemName(serviceType)} located in ${['main area', 'back office', 'reception', 'hallway'][Math.floor(Math.random() * 4)]}`,
      documents: Math.floor(Math.random() * 5),
      images: Math.floor(Math.random() * 8)
    });
  }
  
  return items;
};

const getItemName = (serviceType: string) => {
  const itemNames = {
    'test-a-tag': ['Power Board', 'Extension Cable', 'Desktop Computer', 'Printer', 'Microwave', 'Refrigerator'],
    'rcd': ['RCD Switch', 'Circuit Breaker', 'Power Supply', 'Distribution Board'],
    'emergency-exit': ['Exit Sign', 'Emergency Light', 'Fire Door', 'Evacuation Plan'],
    'thermal-imaging': ['Electrical Panel', 'HVAC Component', 'Motor', 'Transformer'],
    'fire-services': ['Fire Extinguisher', 'Sprinkler Head', 'Smoke Detector', 'Fire Alarm'],
    'air-conditioning': ['AC Unit', 'Cooling System', 'Ventilation Fan', 'Air Handler'],
    'lift-services': ['Elevator', 'Lift Motor', 'Control Panel', 'Door Mechanism'],
    'pest-control': ['Bait Station', 'Monitoring Point', 'Treatment Area', 'Exclusion Point'],
    'cleaning': ['Carpet Area', 'Window', 'Restroom', 'Kitchen']
  };
  
  const options = itemNames[serviceType as keyof typeof itemNames] || ['Item'];
  return options[Math.floor(Math.random() * options.length)];
};

const QRCodeScannerDialog = ({ onScan }: { onScan: (data: string) => void }) => {
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

const ThermalImageAnalysis = ({ item }: { item: any }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const analyzeImage = () => {
    if (!uploadedImage) return;
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const results = {
        hotspots: [
          { x: 35, y: 45, severity: 'high', temp: '78.2°C' },
          { x: 65, y: 30, severity: 'medium', temp: '65.7°C' }
        ],
        avgTemp: '42.3°C',
        maxTemp: '78.2°C',
        recommendation: 'Immediate maintenance required. High temperature detected at power connection point.'
      };
      
      setAnalysisResult(results);
      setAnalyzing(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-md border-gray-300 p-4">
        {!uploadedImage ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Thermometer className="h-10 w-10 text-[#7851CA] mb-2" />
            <p className="text-sm text-gray-500 mb-3">Upload a thermal image of this equipment</p>
            <label className="cursor-pointer">
              <Input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Thermal" 
                className="w-full rounded-md"
              />
              
              {analysisResult && (
                <>
                  {analysisResult.hotspots.map((hotspot: any, index: number) => (
                    <div 
                      key={index}
                      className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white
                        ${hotspot.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ 
                        left: `${hotspot.x}%`, 
                        top: `${hotspot.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      !
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="flex justify-between">
              <label className="cursor-pointer">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </label>
              
              {!analysisResult && !analyzing && (
                <Button 
                  onClick={analyzeImage} 
                  className="bg-[#7851CA] hover:bg-[#6a46b5]"
                >
                  <Thermometer className="h-4 w-4 mr-2" />
                  Analyze Image
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {analyzing && (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          <div className="w-10 h-10 border-4 border-t-[#7851CA] border-gray-200 rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-500">Analyzing thermal image...</p>
        </div>
      )}
      
      {analysisResult && (
        <div className="space-y-4">
          <div className="bg-[#7851CA]/10 p-4 rounded-md">
            <h3 className="font-medium text-[#7851CA] mb-2">Analysis Results</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Measurement</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Average Temperature</TableCell>
                  <TableCell>{analysisResult.avgTemp}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maximum Temperature</TableCell>
                  <TableCell className="text-red-500 font-medium">{analysisResult.maxTemp}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hotspots Detected</TableCell>
                  <TableCell>{analysisResult.hotspots.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium flex items-center text-yellow-800">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Recommendation
              </h4>
              <p className="text-sm text-yellow-800 mt-1">{analysisResult.recommendation}</p>
            </div>
          </div>
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      )}
    </div>
  );
};

const ItemDetailDialog = ({ item }: { item: any }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [description, setDescription] = useState(item.description || '');
  const { serviceType } = useParams<{ serviceType: string }>();
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">View Details</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-[#7851CA]">{item.itemNumber}</span> - {item.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="details" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="media">Photos/Videos</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p>{item.location}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <div className="flex items-center">
                  {item.status === 'Passed' ? (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Passed
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      Failed
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Last Inspection</p>
                <p>{item.lastInspected.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Next Inspection</p>
                <p>{item.nextInspection.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Description</p>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Add a description..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end">
              <Button className="bg-[#7851CA] hover:bg-[#6a46b5]">
                Save Changes
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="media">
            {serviceType === 'thermal-imaging' ? (
              <ThermalImageAnalysis item={item} />
            ) : (
              <>
                <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
                  <div className="flex flex-col items-center justify-center">
                    <Image className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 mb-1">Drag and drop photos or videos</p>
                    <Button variant="outline" size="sm">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </Button>
                  </div>
                </div>
                
                {item.images > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Array.from({ length: item.images }).map((_, index) => (
                      <div key={index} className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
                        <Image className="h-8 w-8 text-gray-400" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">No photos or videos uploaded yet</p>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="reports">
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
              <div className="flex flex-col items-center justify-center">
                <FileText className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Upload inspection reports or certificates</p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Report
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-2" />
                  <div>
                    <p className="text-sm font-medium">Inspection Report</p>
                    <p className="text-xs text-gray-500">Added Jan 15, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="documents">
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4 mb-4">
              <div className="flex flex-col items-center justify-center">
                <File className="h-10 w-10 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-1">Upload related documents</p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </div>
            </div>
            
            {item.documents > 0 ? (
              <div className="space-y-2">
                {Array.from({ length: item.documents }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <File className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium">Document {index + 1}</p>
                        <p className="text-xs text-gray-500">Added {new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">No documents uploaded yet</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

const SiteServicePage = () => {
  const { siteId, serviceType } = useParams<{ siteId: string; serviceType: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const site = siteId && mockSites[siteId as keyof typeof mockSites];
  const service = serviceType && serviceTypes[serviceType as keyof typeof serviceTypes];
  
  const allItems = React.useMemo(() => {
    if (!siteId || !serviceType) return [];
    return generateMockItems(siteId, serviceType);
  }, [siteId, serviceType]);
  
  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const ServiceIcon = service?.icon;
  
  if (!site || !service) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Site or service not found</p>
      </div>
    );
  }
  
  const handleQRScan = (data: string) => {
    console.log("QR Code scanned:", data);
    setSearchQuery(data);
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <Button
              variant="ghost"
              onClick={() => navigate(`/sites/${siteId}`)}
              className="mb-2 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {site.name}
            </Button>
            
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {ServiceIcon && (
                <div className={`p-2 rounded-md mr-2 ${service.color}`}>
                  <ServiceIcon className="h-5 w-5" />
                </div>
              )}
              {service.name} - {site.name}
            </h1>
            <p className="text-gray-500 mt-1">Manage {service.name.toLowerCase()} for this site</p>
          </div>
          
          <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search items..."
                className="pl-9 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <QRCodeScannerDialog onScan={handleQRScan} />
            <Button className="bg-[#7851CA] hover:bg-[#6a46b5]">
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex items-center">
              <Building className="h-5 w-5 text-[#7851CA] mr-2" />
              <div>
                <p className="font-medium">{site.name}</p>
                <p className="text-sm text-gray-500">{site.address}</p>
              </div>
            </div>
            <div className="mt-2 md:mt-0 flex items-center gap-3">
              <div className="text-sm">
                <span className="text-gray-500">Last inspection: </span>
                <span className="font-medium">{new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <div className="text-sm">
                <span className="text-gray-500">Next due: </span>
                <span className="font-medium">{new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
              </div>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Inspection
              </Button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>{item.name}</span>
                  {item.status === 'Passed' ? (
                    <div className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Passed
                    </div>
                  ) : (
                    <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs flex items-center">
                      <X className="h-3 w-3 mr-1" />
                      Failed
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  <span className="font-mono text-xs text-[#7851CA]">{item.itemNumber}</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>{item.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last inspection:</span>
                    <span>{item.lastInspected.toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Next due:</span>
                    <span>{item.nextInspection.toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <ItemDetailDialog item={item} />
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {filteredItems.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No items found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiteServicePage;
