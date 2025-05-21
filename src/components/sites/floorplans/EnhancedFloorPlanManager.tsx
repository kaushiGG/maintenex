import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileInput } from '@/components/ui/file-input';
import { Download, Eye, Upload, Building, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the database floor plan type
interface DbFloorPlan {
  id: string;
  site_id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at?: string;
  uploaded_by?: string;
  floor_name?: string;
}

// Update the FloorPlan interface to match our actual usage
interface FloorPlan {
  id: string;
  site_id: string;
  name: string;
  file_path: string;
  floor_name: string;
  file_type: string;
  created_at: string;
  [key: string]: any; // Add index signature to allow for extra properties
}

interface Site {
  id: string;
  name: string;
}

interface Floor {
  id: string;
  name: string;
}

const EnhancedFloorPlanManager: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState('view');
  const [sites, setSites] = useState<Site[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  const [floorPlanName, setFloorPlanName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch appropriate sites based on active tab
  useEffect(() => {
    if (activeTab === 'view') {
      fetchSitesWithFloorPlans();
    } else {
      fetchAllSites();
    }
  }, [activeTab]);

  // Fetch appropriate floors based on active tab and selected site
  useEffect(() => {
    if (!selectedSite) {
      setFloors([]);
      return;
    }
    
    if (activeTab === 'view') {
      fetchFloorsWithFloorPlans(selectedSite);
    } else {
      fetchAllFloors(selectedSite);
    }
    
    setSelectedFloor(''); // Reset floor selection
  }, [selectedSite, activeTab]);

  // Fetch floor plans when site and floor are selected
  useEffect(() => {
    if (selectedSite && selectedFloor) {
      fetchFloorPlans(selectedSite, selectedFloor);
    } else {
      setFloorPlans([]);
    }
  }, [selectedSite, selectedFloor]);

  // Reset selected site and floor when changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setSelectedSite('');
    setSelectedFloor('');
    setFloorPlans([]);
  };

  // Fetch all sites (for upload tab)
  const fetchAllSites = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('business_sites')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setSites(data || []);
    } catch (error: any) {
      console.error('Error fetching all sites:', error);
      toast.error('Failed to load sites');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch only sites that have floor plans (for view tab)
  const fetchSitesWithFloorPlans = async () => {
    try {
      setIsLoading(true);
      // Get all unique site_ids from floor plans
      const { data: planData, error: planError } = await supabase
        .from('site_floor_plans')
        .select('site_id')
        .order('site_id');
      
      if (planError) throw planError;

      if (!planData || planData.length === 0) {
        setSites([]);
        return;
      }

      // Extract unique site IDs
      const uniqueSiteIds = [...new Set(planData.map(plan => plan.site_id))];

      // Get site details for these IDs
      const { data: siteData, error: siteError } = await supabase
        .from('business_sites')
        .select('id, name')
        .in('id', uniqueSiteIds)
        .order('name');

      if (siteError) throw siteError;
      setSites(siteData || []);
    } catch (error: any) {
      console.error('Error fetching sites with floor plans:', error);
      toast.error('Failed to load sites');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch all floors for a site (for upload tab)
  const fetchAllFloors = async (siteId: string) => {
    try {
      setIsLoading(true);
      // Using static floor data for now
      setFloors([
        { id: 'main-floor', name: 'Main Floor' },
        { id: 'ground-floor', name: 'Ground Floor' },
        { id: 'level-1', name: 'Level 1' },
        { id: 'level-2', name: 'Level 2' },
        { id: 'basement', name: 'Basement' }
      ]);
    } catch (error: any) {
      console.error('Error fetching all floors:', error);
      toast.error('Failed to load floors');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch only floors that have floor plans for a site (for view tab)
  const fetchFloorsWithFloorPlans = async (siteId: string) => {
    try {
      setIsLoading(true);
      
      // First, get a sample floor plan to check available columns
      const { data: sampleData, error: sampleError } = await supabase
        .from('site_floor_plans')
        .select('*')
        .eq('site_id', siteId)
        .limit(1);
      
      if (sampleError) throw sampleError;
      
      // Determine which column to use for floor name
      let floorNameColumn = 'floor_name';
      if (sampleData && sampleData.length > 0) {
        console.log('Sample floor plan columns:', Object.keys(sampleData[0]));
        // If floor_name doesn't exist, try alternative columns
        if (!('floor_name' in sampleData[0])) {
          if ('name' in sampleData[0]) {
            floorNameColumn = 'name';
            console.log('Using "name" column for floor names');
          } else {
            // No suitable column found
            console.warn('Could not find a suitable column for floor names');
            setFloors([]);
            return;
          }
        }
      } else {
        // No floor plans exist for this site
        setFloors([]);
        return;
      }
      
      // Get all data for this site to extract floor names
      const { data, error } = await supabase
        .from('site_floor_plans')
        .select('*')
        .eq('site_id', siteId);
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        setFloors([]);
        return;
      }
      
      // Extract unique floor names safely
      const uniqueFloorNames = [...new Set(data.map(plan => {
        // Use our dynamic floorNameColumn or 'unknown'
        return (plan as any)[floorNameColumn] || 'unknown';
      }))];
      
      // Map to Floor interface
      const floorData: Floor[] = uniqueFloorNames
        .filter(name => name) // Filter out empty/null values
        .map(name => {
          // Create friendly display names based on floor IDs
          let displayName = name;
          if (name === 'main-floor') displayName = 'Main Floor';
          else if (name === 'ground-floor') displayName = 'Ground Floor';
          else if (name === 'level-1') displayName = 'Level 1';
          else if (name === 'level-2') displayName = 'Level 2';
          else if (name === 'basement') displayName = 'Basement';
          
          return {
            id: name,
            name: displayName
          };
        });
      
      setFloors(floorData);
    } catch (error: any) {
      console.error('Error fetching floors with floor plans:', error);
      toast.error('Failed to load floors');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch floor plans for selected site and floor
  const fetchFloorPlans = async (siteId: string, floorId: string) => {
    try {
      setIsLoading(true);
      console.log(`Fetching floor plans for site: ${siteId}, floor: ${floorId}`);
      
      // First, let's just fetch all floor plans for the site to see what data we have
      const { data: allSitePlans, error: allSiteError } = await supabase
        .from('site_floor_plans')
        .select('*')
        .eq('site_id', siteId);
        
      if (allSiteError) {
        console.error('Error fetching all site plans:', allSiteError);
      } else {
        console.log('All floor plans for this site:', allSitePlans);
        
        // Check if we have any sample plan to determine column structure
        if (allSitePlans && allSitePlans.length > 0) {
          console.log('Sample plan fields:', Object.keys(allSitePlans[0]));
          
          // Determine which column to use for floor name
          let floorNameColumn = 'floor_name';
          if (!('floor_name' in allSitePlans[0])) {
            if ('name' in allSitePlans[0]) {
              floorNameColumn = 'name';
              console.log('Using "name" column for floor names');
            }
          }
          
          // Check if we have any floor plans with the specified floor_name
          const floorNamePlans = allSitePlans.filter(plan => (plan as any)[floorNameColumn] === floorId);
          console.log(`Floor plans with ${floorNameColumn}=${floorId}:`, floorNamePlans);
          
          // Now use the correct column for our actual query
          // We're keeping this separate to handle flexibility but also maintain behavior
          console.log(`Using column "${floorNameColumn}" for floor name filter`);
          const { data, error } = await supabase
            .from('site_floor_plans')
            .select('*')
            .eq('site_id', siteId)
            .eq(floorNameColumn, floorId);
            
          if (error) throw error;
          
          console.log('Floor plans data from database:', data);
          
          // If we have data, let's try to display all plans for debugging
          const safeData = Array.isArray(data) ? data.map(plan => {
            // Check the actual data structure
            console.log('Plan details:', plan);
            
            // For debugging purposes, ensure we can retrieve the file URL
            const fileUrl = getPublicUrl(plan.file_path);
            console.log(`Generated URL for ${plan.file_path}:`, fileUrl);
            
            return {
              ...plan,
              floor_name: (plan as any)[floorNameColumn] || floorId || 'unknown'
            };
          }) : [];
          
          console.log('Processed floor plans data:', safeData);
          
          // Directly set as FloorPlan[]
          setFloorPlans(safeData as FloorPlan[]);
          return;
        }
      }
      
      // Fallback approach if we couldn't determine the column name
      const { data, error } = await supabase
        .from('site_floor_plans')
        .select('*')
        .eq('site_id', siteId);
        
      if (error) throw error;
      
      // Default fallback processing
      const safeData = Array.isArray(data) ? data.map(plan => ({
        ...plan,
        floor_name: floorId || 'unknown'
      })) : [];
      
      setFloorPlans(safeData as FloorPlan[]);
    } catch (error: any) {
      console.error('Error fetching floor plans:', error);
      toast.error('Failed to load floor plans: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Please select an image or PDF file');
        setSelectedFile(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Use file name as default plan name if not set
      if (!floorPlanName) {
        const fileName = file.name.split('.')[0];
        setFloorPlanName(fileName);
      }
    }
  };

  // Handle floor plan upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSite) {
      setError('Please select a site');
      return;
    }
    
    if (!selectedFloor) {
      setError('Please select a floor');
      return;
    }
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!floorPlanName) {
      setError('Please enter a name for the floor plan');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `floor-plans/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('floorplans')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('floorplans')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Save metadata to database
      const { data: floorPlanData, error: dbError } = await supabase
        .from('site_floor_plans')
        .insert({
          name: floorPlanName,
          file_path: filePath,
          site_id: selectedSite,
          floor_name: selectedFloor,
          file_type: selectedFile.type
        })
        .select()
        .single();
      
      if (dbError) throw dbError;
      
      toast.success('Floor plan uploaded successfully');
      
      // Ensure the returned data has the floor_name property
      const safeFloorPlan = {
        ...floorPlanData,
        floor_name: floorPlanData.floor_name || selectedFloor
      };
      
      // Update the floor plans list with type assertion
      setFloorPlans(prev => [...prev, safeFloorPlan as FloorPlan]);
      
      // Reset form
      setFloorPlanName('');
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.querySelector('input[type=file]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      
    } catch (err: any) {
      console.error('Error uploading floor plan:', err);
      setError(err.message || 'Error uploading floor plan');
      toast.error('Failed to upload floor plan');
    } finally {
      setIsUploading(false);
    }
  };

  // Download floor plan
  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'floor-plan';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get the public URL for a floor plan
  const getPublicUrl = (filePath: string) => {
    console.log('Getting public URL for file path:', filePath);
    
    if (!filePath) {
      console.warn('Empty file path provided to getPublicUrl');
      return '';
    }
    
    // Check if the path is already a full URL
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      console.log('File path is already a full URL:', filePath);
      return filePath;
    }
    
    try {
      const { data } = supabase.storage
        .from('floorplans')
        .getPublicUrl(filePath);
      
      console.log('Generated public URL:', data.publicUrl);
      return data.publicUrl;
    } catch (error) {
      console.error('Error generating public URL:', error);
      return '';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Floor Plan Management</h1>
      
      <Tabs defaultValue="view" value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="view">View Floor Plans</TabsTrigger>
          <TabsTrigger value="upload">Upload Floor Plans</TabsTrigger>
        </TabsList>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="site-select">Select Site</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger id="site-select">
                <SelectValue placeholder="Select a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="floor-select">Select Floor</Label>
            <Select 
              value={selectedFloor} 
              onValueChange={setSelectedFloor}
              disabled={!selectedSite || floors.length === 0}
            >
              <SelectTrigger id="floor-select">
                <SelectValue placeholder="Select a floor" />
              </SelectTrigger>
              <SelectContent>
                {floors.map(floor => (
                  <SelectItem key={floor.id} value={floor.id}>
                    {floor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="view">
          {isLoading ? (
            <Card>
              <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
                <div className="flex flex-col items-center">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                  <p className="mt-4 text-muted-foreground">Loading floor plans...</p>
                </div>
              </CardContent>
            </Card>
          ) : !selectedSite || !selectedFloor ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">Please select a site and floor</p>
                  <p className="text-muted-foreground">
                    Select a site and floor from the dropdown menus above to view floor plans
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : floorPlans.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">No floor plans available</p>
                  <p className="text-muted-foreground">
                    No floor plans found for this site and floor. Upload some using the Upload tab.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {floorPlans.map(plan => {
                const imageUrl = getPublicUrl(plan.file_path);
                const fileName = plan.file_path.split('/').pop() || `${plan.name}.jpg`;
                return (
                  <div key={plan.id} className="bg-white rounded-md p-4 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">{plan.name}</h3>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(imageUrl, fileName)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`${plan.name} preview`}
                        className="w-full object-contain"
                        style={{ maxHeight: '300px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              {!selectedSite || !selectedFloor ? (
                <div className="text-center py-8">
                  <Building className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-lg font-medium">Please select a site and floor</p>
                  <p className="text-muted-foreground">
                    Select a site and floor from the dropdown menus above to upload floor plans
                  </p>
                </div>
              ) : (
                <form onSubmit={handleUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="plan-name">Floor Plan Name</Label>
                    <Input
                      id="plan-name"
                      value={floorPlanName}
                      onChange={(e) => setFloorPlanName(e.target.value)}
                      placeholder="Enter a name for this floor plan"
                      required
                    />
                  </div>
                  
                  <FileInput
                    label="Upload Floor Plan"
                    accept="image/*, application/pdf"
                    onChange={handleFileChange}
                    error={error || undefined}
                    required
                  />
                  
                  <div className="text-sm text-gray-500">
                    <p>Supported formats: JPG, PNG, PDF</p>
                    <p>Maximum file size: 5MB</p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isUploading || !selectedFile}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Floor Plan
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFloorPlanManager; 