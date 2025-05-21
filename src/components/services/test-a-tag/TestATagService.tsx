import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Bluetooth, QrCode, Tag, FileDown, FileUp, Search, MapPin, ArrowLeft, FileBarChart, Printer, Building, Loader2, Clock, User, Briefcase, ClipboardCheck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface JobDetails {
  id: string;
  title: string;
  description?: string;
  status: string;
  service_type: string;
  due_date?: string;
  client_id?: string;
  notes?: string;
  client?: {
    id: string;
    name: string;
    business_name?: string;
    phone?: string;
    email?: string;
  };
}

interface SiteData {
  id: string;
  name: string;
  address?: string;
  description?: string;
  type?: string;
  location?: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  notes?: string;
}

interface Equipment {
  id: string;
  name: string;
  description?: string;
  location?: string;
  type?: string;
  status?: string;
  last_test_date?: string;
  next_test_date?: string;
  site_id: string;
}

const TestATagService = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [siteData, setSiteData] = useState<SiteData | null>(null);
  const [jobData, setJobData] = useState<JobDetails | null>(null);
  const [equipmentData, setEquipmentData] = useState<Equipment[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const siteId = queryParams.get('siteId');
  const siteName = queryParams.get('siteName');
  const jobId = queryParams.get('jobId');
  const clientName = queryParams.get('clientName');
  const siteAddress = queryParams.get('siteAddress');
  const siteDescription = queryParams.get('siteDescription');
  const siteType = queryParams.get('siteType');
  const jobDescription = queryParams.get('jobDescription');
  const assignmentNotes = queryParams.get('assignmentNotes');
  const siteContactName = queryParams.get('siteContactName');
  const siteContactPhone = queryParams.get('siteContactPhone');
  const siteContactEmail = queryParams.get('siteContactEmail');
  const clientPhone = queryParams.get('clientPhone');
  const clientEmail = queryParams.get('clientEmail');
  const siteNotes = queryParams.get('siteNotes');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Initialize data fetching promises for parallel execution
        const promises = [];
        
        // 1. Fetch site data if siteId is provided
        if (siteId) {
          console.log('Fetching site data for ID:', siteId);
          const sitePromise = supabase
            .from('business_sites')
            .select('*')
            .eq('id', siteId)
            .single();
          
          promises.push(sitePromise);
        }
        
        // 2. Fetch job data if jobId is provided
        if (jobId) {
          console.log('Fetching job data for ID:', jobId);
          const jobPromise = supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single();
          
          promises.push(jobPromise);
        }
        
        // 3. Fetch equipment data
        if (siteId) {
          console.log('Fetching equipment for site ID:', siteId);
          const equipmentPromise = supabase
            .from('equipment')
            .select('*')
            .eq('site_id', siteId);
          
          promises.push(equipmentPromise);
        }
        
        // Execute all promises in parallel
        const results = await Promise.all(promises);
        
        // Process results based on the order we added the promises
        let index = 0;
        
        // Process site data
        if (siteId) {
          const siteResult = results[index++];
          
          if (siteResult.error) {
            console.error('Error fetching site data:', siteResult.error);
          } else if (siteResult.data) {
            console.log('Site data fetched successfully:', siteResult.data);
            
            // Merge data from URL params with database data
            setSiteData({
              id: siteId,
              name: siteResult.data.name || siteName || 'Unknown Site',
              address: siteResult.data.address || siteAddress,
              description: siteResult.data.description || siteDescription,
              type: siteResult.data.type || siteType,
              contact_name: siteResult.data.contact_name || siteContactName,
              contact_phone: siteResult.data.contact_phone || siteResult.data.phone || siteContactPhone,
              contact_email: siteResult.data.contact_email || siteResult.data.email || siteContactEmail,
              notes: siteResult.data.notes || siteNotes
            });
          } else {
            // Fallback to URL parameters if no data found
            console.log('No site data found in database, using URL params');
            setSiteData({
              id: siteId,
              name: siteName || 'Unknown Site',
              address: siteAddress,
              description: siteDescription,
              type: siteType,
              contact_name: siteContactName,
              contact_phone: siteContactPhone,
              contact_email: siteContactEmail,
              notes: siteNotes
            });
          }
        }
        
        // Process job data
        if (jobId) {
          const jobResult = results[index++];
          
          if (jobResult.error) {
            console.error('Error fetching job data:', jobResult.error);
          } else if (jobResult.data) {
            console.log('Job data fetched successfully:', jobResult.data);
            
            // We need to fetch client data separately
            let clientData = null;
            if (jobResult.data.client_id) {
              const { data: client, error: clientError } = await supabase
                .from('clients')
                .select('*')
                .eq('id', jobResult.data.client_id)
                .single();
                
              if (!clientError && client) {
                clientData = client;
              }
            }
            
            // Set job data with client info
            setJobData({
              ...jobResult.data,
              client: clientData || {
                id: 'unknown',
                name: clientName || 'Unknown Client',
                phone: clientPhone,
                email: clientEmail
              }
            });
          }
        }
        
        // Process equipment data
        if (siteId) {
          const equipmentResult = results[index++];
          
          if (equipmentResult.error) {
            console.error('Error fetching equipment data:', equipmentResult.error);
          } else if (equipmentResult.data && equipmentResult.data.length > 0) {
            console.log('Equipment data loaded:', equipmentResult.data.length, 'items');
            setEquipmentData(equipmentResult.data);
          } else {
            // Try alternative approach to find equipment if none found by site_id
            if (jobId) {
              console.log('No equipment found by site_id, trying job_equipment relation');
              await fetchEquipmentByJobId(jobId);
            } else {
              console.log('No equipment found');
              setEquipmentData([]);
            }
          }
        }
      } catch (error) {
        console.error('Error in fetchData:', error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    // Helper function to fetch equipment by job ID
    const fetchEquipmentByJobId = async (jobId: string) => {
      try {
        // Check if there's a job_equipment association table
        const { data: jobEquipment, error: jobEquipError } = await supabase
          .from('job_equipment')
          .select('equipment_id')
          .eq('job_id', jobId);
          
        if (!jobEquipError && jobEquipment && jobEquipment.length > 0) {
          console.log('Found job-equipment associations:', jobEquipment.length);
          
          // Get equipment IDs
          const equipmentIds = jobEquipment.map(je => je.equipment_id);
          
          // Fetch the actual equipment
          const { data: linkedEquipment, error: linkedEquipError } = await supabase
            .from('equipment')
            .select('*')
            .in('id', equipmentIds);
            
          if (!linkedEquipError && linkedEquipment && linkedEquipment.length > 0) {
            console.log('Found linked equipment:', linkedEquipment.length, 'items');
            setEquipmentData(linkedEquipment);
          } else {
            console.log('No linked equipment found');
            setEquipmentData([]);
          }
        } else {
          console.log('No job_equipment associations found');
          setEquipmentData([]);
        }
      } catch (error) {
        console.error('Error fetching equipment by job ID:', error);
        setEquipmentData([]);
      }
    };
    
    fetchData();
  }, [jobId, siteId, siteName, siteAddress, siteDescription, siteType, clientName, clientPhone, clientEmail, siteContactName, siteContactPhone, siteContactEmail, siteNotes, toast]);
  
  const handleConnect = () => {
    setIsConnected(true);
    toast({
      title: "Connected",
      description: "Successfully connected to Kyoritsu test device and printer"
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Data Exported",
      description: "CSV file has been generated and downloaded"
    });
  };

  const handleBackClick = () => {
    navigate('/jobs/assigned');
  };

  const handleCompleteTest = async () => {
    if (!jobId) {
      toast({
        title: "Error",
        description: "No job ID found to mark as completed",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase.rpc('update_job_status', { 
        job_id: jobId, 
        new_status: 'completed' 
      });
      
      if (error) {
        console.error('Error completing job:', error);
        toast({
          title: "Error",
          description: "Failed to mark job as completed",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Job has been marked as completed"
        });
        
        // Optionally navigate back to the jobs list
        setTimeout(() => {
          navigate('/jobs/assigned');
        }, 2000);
      }
    } catch (err) {
      console.error('Error in handleCompleteTest:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    }
  };

  const testHistory = [{
    year: 2023,
    testsCompleted: 550,
    passRate: '92%',
    failRate: '8%',
    missing: 15
  }, {
    year: 2022,
    testsCompleted: 756,
    passRate: '89%',
    failRate: '11%',
    missing: 12
  }, {
    year: 2021,
    testsCompleted: 691,
    passRate: '91%',
    failRate: '9%',
    missing: 8
  }];
  
  // Calculate test completion percentage for job info card
  const equipmentTested = equipmentData.filter(item => item.status === 'passed' || item.status === 'failed').length;
  const testCompletionPercent = equipmentData.length > 0 ? Math.round((equipmentTested / equipmentData.length) * 100) : 0;
  
  return <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={handleBackClick}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Button>
          <h1 className="text-2xl font-bold">Test and Tags Management</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportData} variant="outline" className="gap-1">
            <FileDown className="h-4 w-4" />
          Export Data
        </Button>
          <Button onClick={handleCompleteTest} className="bg-green-600 hover:bg-green-700 gap-1">
            <ClipboardCheck className="h-4 w-4" />
            Complete Job
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card className="mb-6">
          <CardContent className="p-8 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span>Loading site and equipment data...</span>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Site Information Card */}
            <Card className="mb-0">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Building className="h-5 w-5 text-purple-600 mr-2" />
                  Site Information
                </h3>
                <div className="grid gap-2">
                  <div>
                    <span className="font-medium">Name:</span> {siteData?.name || siteName || 'Unknown'}
                  </div>
                  {(siteData?.address || siteAddress) && (
                    <div>
                      <span className="font-medium">Address:</span> {siteData?.address || siteAddress}
                    </div>
                  )}
                  {(siteData?.type || siteType) && (
                    <div>
                      <span className="font-medium">Type:</span> {siteData?.type || siteType}
                    </div>
                  )}
                  {(siteData?.contact_name || siteContactName) && (
                    <div>
                      <span className="font-medium">Contact:</span> {siteData?.contact_name || siteContactName}
                    </div>
                  )}
                  {(siteData?.contact_phone || siteContactPhone) && (
                    <div>
                      <span className="font-medium">Phone:</span> {siteData?.contact_phone || siteContactPhone}
                    </div>
                  )}
                  {(siteData?.contact_email || siteContactEmail) && (
                    <div>
                      <span className="font-medium">Email:</span> {siteData?.contact_email || siteContactEmail}
                    </div>
                  )}
                  {(siteData?.description || siteDescription) && (
                    <div>
                      <span className="font-medium">Description:</span> {siteData?.description || siteDescription}
                    </div>
                  )}
                  {(siteData?.notes || siteNotes) && (
                    <div>
                      <span className="font-medium">Site Notes:</span> {siteData?.notes || siteNotes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Job Information Card */}
            <Card className="mb-0">
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-600 mr-2" />
                  Job Information
                </h3>
                <div className="grid gap-2">
                  {(jobData?.title || jobId) && (
                    <div>
                      <span className="font-medium">Job:</span> {jobData?.title || `Job #${jobId}`}
                    </div>
                  )}
                  {jobData?.status && (
                    <div>
                      <span className="font-medium">Status:</span> {' '}
                      <Badge variant={
                        jobData.status.toLowerCase() === 'completed' ? 'default' : 
                        jobData.status.toLowerCase() === 'in-progress' ? 'secondary' : 
                        'outline'
                      }>
                        {jobData.status}
                      </Badge>
                    </div>
                  )}
                  <div>
                    <span className="font-medium">Equipment:</span> {equipmentData.length} items ({testCompletionPercent}% tested)
                  </div>
                  {(jobData?.description || jobDescription) && (
                    <div>
                      <span className="font-medium">Description:</span> {jobData?.description || jobDescription}
                    </div>
                  )}
                  {(jobData?.notes || assignmentNotes) && (
                    <div className="col-span-2 border-t pt-2 mt-2">
                      <span className="font-medium">Assignment Notes:</span> {jobData?.notes || assignmentNotes}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-blue-600">
                <Bluetooth className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Device Connection</h3>
              </div>
              <p className="text-gray-600">Connect to test device and printer</p>
              <Button onClick={handleConnect} className={isConnected ? "bg-green-600 hover:bg-green-700" : ""}>
                {isConnected ? "Connected" : "Connect Devices"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <QrCode className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Scan Equipment</h3>
              </div>
              <p className="text-gray-600">Scan QR code to identify equipment</p>
              <Button>Start Scanning</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-red-600">
                <Tag className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Print Tags</h3>
              </div>
              <p className="text-gray-600">Print new tags and stickers</p>
              <Button>Print Tags</Button>
            </div>
          </CardContent>
        </Card>
      </div>
        </>
      )}

      <Tabs defaultValue="equipment" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="testHistory">Test History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="equipment" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Equipment Details</h2>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-1">
                <Search className="h-4 w-4" />
                Track Equipment
              </Button>
              <Button variant="outline" className="gap-1">
                <Tag className="h-4 w-4" />
                New Test
              </Button>
            </div>
          </div>

          {isLoading ? (
            <Card className="bg-gray-50">
              <CardContent className="p-12 text-center flex flex-col items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin mb-2" />
                <p className="text-gray-500">Loading equipment data...</p>
              </CardContent>
            </Card>
          ) : isConnected ? (
            equipmentData.length > 0 ? (
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Equipment Name</TableHead>
                      <TableHead>Description</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Last Test Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Next Test</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {equipmentData.map(item => (
                      <TableRow key={item.id}>
                      <TableCell>{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                        <TableCell>{item.description || '-'}</TableCell>
                        <TableCell>{item.location || '-'}</TableCell>
                        <TableCell>{item.last_test_date || 'Not tested'}</TableCell>
                      <TableCell>
                          <Badge variant={
                            item.status === 'passed' ? 'default' : 
                            item.status === 'failed' ? 'destructive' : 'outline'
                          }>
                            {item.status || 'pending'}
                        </Badge>
                      </TableCell>
                        <TableCell>{item.next_test_date || '-'}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardContent className="p-12 text-center">
                  <p className="text-gray-500">No equipment found for this site. Add equipment to get started.</p>
                </CardContent>
              </Card>
            )
          ) : (
            <Card className="bg-gray-50">
              <CardContent className="p-12 text-center">
                <p className="text-gray-500">Connect to a test device to start managing equipment</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="testHistory">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Testing History</h2>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-1">
                  <FileUp className="h-4 w-4" />
                  Import CSV
                </Button>
                <Button variant="outline" className="gap-1">
                  <FileDown className="h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Year</TableHead>
                    <TableHead>Tests Completed</TableHead>
                    <TableHead>Pass Rate</TableHead>
                    <TableHead>Fail Rate</TableHead>
                    <TableHead>Missing Equipment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {testHistory.map(item => <TableRow key={item.year}>
                      <TableCell>{item.year}</TableCell>
                      <TableCell>{item.testsCompleted}</TableCell>
                      <TableCell>{item.passRate}</TableCell>
                      <TableCell>{item.failRate}</TableCell>
                      <TableCell>{item.missing}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          <FileBarChart className="h-4 w-4 mr-1" />
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>)}
                </TableBody>
              </Table>
            </div>

            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="text-amber-800">
                  <strong>Note:</strong> We completed 756 tests in 2022, but only 550 in 2023. This is a decrease of 206 tests (27.2%).
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Testing Analytics</h2>
              <Button variant="outline" className="gap-1">
                <FileDown className="h-4 w-4" />
                Export Report
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">Total Equipment</h3>
                    <p className="text-3xl font-bold mt-1">{equipmentData.length || "0"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">Pass Rate (Current Year)</h3>
                    <p className="text-3xl font-bold mt-1 text-green-600">92%</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className="text-sm font-medium text-gray-500">Equipment Missing</h3>
                    <p className="text-3xl font-bold mt-1 text-amber-600">15</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-medium mb-4">Testing Statistics by Department</h3>
                <div className="h-64 flex items-center justify-center bg-gray-100 rounded-md">
                  <p className="text-gray-500">Analytics charts would appear here</p>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Failed Equipment by Type</h3>
                  <div className="h-48 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">Pie chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-medium mb-4">Monthly Testing Activity</h3>
                  <div className="h-48 flex items-center justify-center bg-gray-100 rounded-md">
                    <p className="text-gray-500">Line chart would appear here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};

export default TestATagService;
