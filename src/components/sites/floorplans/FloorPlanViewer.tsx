import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, MapPin, ExternalLink, Copy, File } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { getPublicFileUrl } from '@/utils/fileUpload';
import { Label } from '@/components/ui/label';

interface FloorPlan {
  id: string;
  site_id: string;
  name: string;
  file_path: string;
  created_at: string;
}

interface FloorPlanViewerProps {
  siteId?: string;
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ siteId }) => {
  // State for data
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [sites, setSites] = useState<{ id: string; name: string }[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  
  // Selection state
  const [selectedSite, setSelectedSite] = useState<string>(siteId || '');
  const [selectedFloor, setSelectedFloor] = useState<string>('');
  
  // Loading states
  const [sitesLoading, setSitesLoading] = useState<boolean>(true);
  const [floorsLoading, setFloorsLoading] = useState<boolean>(false);
  const [plansLoading, setPlansLoading] = useState<boolean>(false);

  // Add a state to track which images have failed to load
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  // Initialize with siteId if provided
  useEffect(() => {
    if (siteId) {
      setSelectedSite(siteId);
    }
    
    // Check if the site_floor_plans table exists
    checkTableExists();
  }, [siteId]);

  // Fetch all sites - only runs once
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        console.log("Fetching all sites...");
        
        const { data: siteData, error: siteError } = await supabase
          .from('business_sites')
          .select('id, name');

        if (siteError) throw siteError;
        
        console.log(`Fetched ${siteData.length} sites`);
        setSites(siteData.map((site: any) => ({ id: site.id, name: site.name })));
        
        // If no site is selected and we have sites, select the first one
        if (siteData.length > 0 && !selectedSite) {
          setSelectedSite(siteData[0].id);
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      } finally {
        setSitesLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Fetch floors when site changes - only depends on selectedSite
  useEffect(() => {
    const fetchFloors = async () => {
      // Reset floor selection and plans when site changes
      setSelectedFloor('');
      setFloorPlans([]);
      
      if (!selectedSite) return;
      
      try {
        setFloorsLoading(true);
        console.log(`Fetching floors for site: ${selectedSite}`);
        
        const { data, error } = await supabase
          .from('site_floor_plans')
          .select('name')
          .eq('site_id', selectedSite)
          .order('name');
          
        if (error) throw error;
        
        // Extract unique floor names
        const uniqueFloors = [...new Set(data.map((plan: any) => plan.name))];
        console.log(`Found ${uniqueFloors.length} unique floors`);
        setFloors(uniqueFloors);
        
        // DO NOT auto-select floors - make user explicitly choose
        if (uniqueFloors.length === 0) {
          toast.info('No floor plans available for this site');
        }
      } catch (error) {
        console.error('Error fetching floors:', error);
        toast.error('Failed to load available floors');
      } finally {
        setFloorsLoading(false);
      }
    };

    if (selectedSite) {
      fetchFloors();
    }
  }, [selectedSite]);

  // Add a function to check if an image exists before trying to display it
  const preloadImage = (url: string, id: string) => {
    const img = new Image();
    
    img.onload = () => {
      console.log(`Image loaded successfully: ${url}`);
    };
    
    img.onerror = () => {
      console.error(`Failed to load image: ${url}`);
      setFailedImages(prev => ({ ...prev, [id]: true }));
    };
    
    img.src = url;
  };

  // Update the useEffect that fetches floor plans to preload images
  useEffect(() => {
    const fetchFloorPlans = async () => {
      // ONLY fetch if BOTH site AND floor are explicitly selected
      if (!selectedSite || !selectedFloor) {
        return;
      }
      
      try {
        setPlansLoading(true);
        console.log(`Fetching floor plans for site ${selectedSite}, floor ${selectedFloor}`);
        
        const { data, error } = await supabase
          .from('site_floor_plans')
          .select('*')
          .eq('site_id', selectedSite)
          .eq('name', selectedFloor);
          
        if (error) throw error;
        
        console.log(`Fetched ${data.length} floor plans`);
        
        // Only set floor plans if we have both selections
        if (selectedSite && selectedFloor) {
          setFloorPlans(data);
          
          // Debug file paths
          if (data.length > 0) {
            data.forEach(plan => {
              console.log(`Plan ${plan.id} path: ${plan.file_path}`);
              const url = getPublicFileUrl('floorplans', plan.file_path);
              console.log(`Generated URL: ${url}`);
              
              // Only preload images when we're sure we want to display them
              if (url) {
                preloadImage(url, plan.id);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error fetching floor plans:', error);
        toast.error('Failed to load floor plans');
      } finally {
        setPlansLoading(false);
      }
    };

    // Only fetch floor plans if both site and floor are selected
    if (selectedSite && selectedFloor) {
      fetchFloorPlans();
    } else {
      // Clear floor plans if either selection is missing
      setFloorPlans([]);
      setPlansLoading(false);
    }
  }, [selectedSite, selectedFloor]);

  // Function to get the public URL for a file
  const getPublicUrl = (filePath: string) => {
    try {
      return getPublicFileUrl('floorplans', filePath) || '/placeholder-floor-plan.png';
    } catch (error) {
      console.error('Error getting public URL:', error);
      return '/placeholder-floor-plan.png';
    }
  };

  // Function to download a floor plan
  const downloadFloorPlan = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Floor plan download started');
  };

  // Add a function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success('URL copied to clipboard');
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy URL');
      });
  };

  // Add a function to show permissions help
  const showPermissionsHelp = () => {
    toast(
      <div>
        <h3 className="font-medium mb-1">Storage Permissions Issue</h3>
        <p className="text-sm mb-2">The floor plan images can't be loaded because of Supabase storage permissions.</p>
        <ol className="text-sm list-decimal pl-4 space-y-1">
          <li>Go to your Supabase dashboard</li>
          <li>Navigate to Storage → Buckets → floorplans</li>
          <li>Click the Settings icon (gear)</li>
          <li>Enable "Public bucket" option</li>
          <li>Go to the Policies tab</li>
          <li>Add a policy that allows public access to the bucket</li>
        </ol>
      </div>,
      {
        duration: 10000,
        action: {
          label: 'Dismiss',
          onClick: () => {}
        }
      }
    );
  };

  // Add a function to download SQL for bucket permissions
  const downloadBucketPermissionsSQL = () => {
    const sql = `-- Make the floorplans bucket public and set permissions
BEGIN;

-- First check if bucket exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'floorplans'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('floorplans', 'floorplans', true);
  ELSE
    -- If bucket exists, make it public
    UPDATE storage.buckets
    SET public = true
    WHERE name = 'floorplans';
  END IF;
END $$;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Access to floorplans" ON storage.objects;

-- Create policy for public access to the floorplans bucket
CREATE POLICY "Public Access to floorplans"
ON storage.objects FOR SELECT
USING (bucket_id = 'floorplans');

-- Create policy for authenticated users to manage their own files
CREATE POLICY "Authenticated users can manage floorplans"
ON storage.objects FOR ALL
USING (
  bucket_id = 'floorplans'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'floorplans'
  AND auth.role() = 'authenticated'
);

COMMIT;
`;

    // Create a blob and download link for the SQL
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fix_floorplans_bucket_permissions.sql';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success('SQL script downloaded. Run this in the Supabase SQL editor.');
  };

  // Function to download SQL to create the floorplans bucket
  const downloadCreateFloorplansBucketSQL = () => {
    const sql = `-- Create floorplans bucket and set permissions
BEGIN;

-- First check if bucket exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'floorplans'
  ) THEN
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('floorplans', 'floorplans', true);
  ELSE
    -- If bucket exists, make sure it's public
    UPDATE storage.buckets
    SET public = true
    WHERE name = 'floorplans';
  END IF;
END $$;

-- Drop any conflicting policies
DROP POLICY IF EXISTS "Public Access to floorplans" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can manage floorplans" ON storage.objects;

-- Create policy for public access to the floorplans bucket
CREATE POLICY "Public Access to floorplans"
ON storage.objects FOR SELECT
USING (bucket_id = 'floorplans');

-- Create policy for authenticated users to manage their own files
CREATE POLICY "Authenticated users can manage floorplans"
ON storage.objects FOR ALL
USING (
  bucket_id = 'floorplans'
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  bucket_id = 'floorplans'
  AND auth.role() = 'authenticated'
);

COMMIT;`;

    // Create a blob and download link for the SQL
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'create_floorplans_bucket.sql';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success('SQL for creating floorplans bucket downloaded. Run this in your Supabase SQL Editor.');
  };

  // Update the site dropdown with a handler function
  const handleSiteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSiteId = e.target.value;
    console.log(`Site selection changed to: ${newSiteId}`);
    
    // Clear dependent states
    setSelectedFloor('');
    setFloorPlans([]);
    setFailedImages({});
    
    // Set the new site
    setSelectedSite(newSiteId);
  };

  // Add a handler for floor selection
  const handleFloorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFloor = e.target.value;
    console.log(`Floor selection changed to: ${newFloor}`);
    
    // Clear any previous floor plan data and errors
    setFloorPlans([]);
    setFailedImages({});
    
    // Set the new floor
    setSelectedFloor(newFloor);
  };

  // Add a function to check if the database table exists
  const checkTableExists = async () => {
    try {
      // Try a basic query to see if the table exists
      const { count, error } = await supabase
        .from('site_floor_plans')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error checking site_floor_plans table:', error);
        if (error.code === '42P01') { // Table doesn't exist error code
          showTableSetupHelp();
        }
      } else {
        console.log(`site_floor_plans table exists with ${count} records`);
      }
    } catch (err) {
      console.error('Error checking table:', err);
    }
  };
  
  // Function to show help for setting up the database table
  const showTableSetupHelp = () => {
    toast(
      <div>
        <h3 className="font-medium mb-1">Database Setup Required</h3>
        <p className="text-sm mb-2">The site_floor_plans table does not exist in your database.</p>
        <p className="text-sm mb-2">You need to run the database migration to create the table.</p>
        <button 
          className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
          onClick={downloadMigrationSQL}
        >
          Download Migration SQL
        </button>
      </div>,
      {
        duration: 10000,
      }
    );
  };
  
  // Function to download the SQL migration for the site_floor_plans table
  const downloadMigrationSQL = () => {
    const sql = `-- Create site_floor_plans table
CREATE TABLE IF NOT EXISTS public.site_floor_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID NOT NULL REFERENCES public.business_sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Add RLS policies
ALTER TABLE public.site_floor_plans ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Floor plans are viewable by authenticated users" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can insert floor plans" ON public.site_floor_plans;
DROP POLICY IF EXISTS "Users can delete their own floor plans" ON public.site_floor_plans;

-- Allow all authenticated users to select floor plans
CREATE POLICY "Floor plans are viewable by authenticated users" 
  ON public.site_floor_plans FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert their own floor plans
CREATE POLICY "Users can insert floor plans" 
  ON public.site_floor_plans FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Allow users to delete floor plans they uploaded
CREATE POLICY "Users can delete their own floor plans"
  ON public.site_floor_plans FOR DELETE
  USING (auth.uid() = uploaded_by);

-- Grant permissions to authenticated users
GRANT ALL ON public.site_floor_plans TO authenticated;`;
    
    // Create a blob and download link for the SQL
    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'create_site_floor_plans.sql';
    
    // Trigger download
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    // Clean up
    URL.revokeObjectURL(url);
    
    toast.success('SQL migration script downloaded. Run this in your Supabase SQL Editor.');
  };

  // Rendered UI
  return (
    <div className="space-y-4">
      {/* Site & Floor Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Floor Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Site dropdown */}
            <div className="w-full md:w-1/2">
              <Label htmlFor="site-select">Select Site</Label>
              <div className="relative">
                <select
                  id="site-select"
                  className="w-full h-10 pl-3 pr-10 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                  value={selectedSite}
                  onChange={handleSiteChange}
                  disabled={sitesLoading}
                >
                  <option value="">Select a site</option>
                  {sites.map(site => (
                    <option key={site.id} value={site.id}>{site.name}</option>
                  ))}
                </select>
                {sitesLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Floor dropdown */}
            <div className="w-full md:w-1/2">
              <Label htmlFor="floor-select">Select Floor</Label>
              <div className="relative">
                <select
                  id="floor-select"
                  className="w-full h-10 pl-3 pr-10 py-2 text-base border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background"
                  value={selectedFloor}
                  onChange={handleFloorChange}
                  disabled={floorsLoading || !selectedSite || floors.length === 0}
                >
                  <option value="">Select a floor</option>
                  {floors.map(floor => (
                    <option key={floor} value={floor}>{floor}</option>
                  ))}
                </select>
                {floorsLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Floor Plan Images Section */}
      <Card>
        <CardHeader>
          <CardTitle>Floor Plan Images</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Loading State */}
          {plansLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="ml-3 text-gray-600">Loading floor plans...</span>
            </div>
          ) : !selectedSite ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
              <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-lg font-medium text-gray-600">No Site Selected</h3>
              <p className="text-gray-500 max-w-md mx-auto mt-1">
                Please select a site from the dropdown above to view its floor plans.
              </p>
            </div>
          ) : !selectedFloor ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
              <File className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <h3 className="text-base font-medium text-gray-600">No Floor Selected</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
                Please select a floor from the dropdown to view its plans.
              </p>
            </div>
          ) : floorPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {floorPlans.map((plan) => {
                const imageUrl = getPublicUrl(plan.file_path);
                const fileName = plan.file_path.split('/').pop() || `${plan.name}.jpg`;
                
                return (
                  <div key={plan.id} className="border rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-4 border-b">
                      <div className="flex justify-between items-center">
                        <h3 className="text-base font-medium">{plan.name}</h3>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => downloadFloorPlan(imageUrl, fileName)}
                          title="Download floor plan"
                        >
                          <Download className="h-4 w-4 text-blue-600" />
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(plan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-4">
                      {failedImages[plan.id] ? (
                        <div className="w-full h-[300px] flex flex-col items-center justify-center bg-gray-100 rounded-md border">
                          <MapPin className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500 text-center">Image not available</p>
                          <p className="text-xs text-gray-400 mt-1">The image could not be loaded</p>
                          
                          {/* Debug buttons */}
                          <div className="mt-4 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(imageUrl, '_blank')}
                              title="Open URL in new tab"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" /> Open URL
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(imageUrl)}
                              title="Copy URL to clipboard"
                            >
                              <Copy className="h-4 w-4 mr-1" /> Copy URL
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <img 
                          src={imageUrl} 
                          alt={plan.name} 
                          className="w-full h-auto rounded-md max-h-[500px] object-contain border" 
                          onError={(e) => {
                            console.error('Error loading image:', imageUrl);
                            setFailedImages(prev => ({ ...prev, [plan.id]: true }));
                            (e.target as HTMLImageElement).src = '/placeholder-floor-plan.png';
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : selectedSite && selectedFloor ? (
            <div className="flex md:flex-row flex-col gap-6">
              <div className="flex-1 flex flex-col justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">No floor plans found for the selected floor.</p>
                <p className="text-sm text-gray-400 mt-2">Try selecting a different floor or upload new floor plans.</p>
              </div>
              <div className="md:w-1/3 w-full p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-base font-medium text-blue-700 mb-2">No Floor Plans Found</h3>
                <p className="text-sm text-blue-700 mb-4">
                  There are no floor plans available for the selected floor. Consider the following:
                </p>
                <ul className="text-sm text-blue-700 list-disc pl-4 space-y-2">
                  <li>Select a different floor from the dropdown</li>
                  <li>Use the "Upload Floor Plan" tab to add new floor plans</li>
                  <li>Make sure the site and floor information is correct</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex md:flex-row flex-col gap-6">
              <div className="flex-1 flex justify-center items-center h-64 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <div className="text-center p-6">
                  <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Please select a site and floor to view floor plans</p>
                </div>
              </div>
              <div className="md:w-1/3 w-full p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-base font-medium text-blue-700 mb-2">Getting Started</h3>
                <ol className="text-xs text-blue-700 list-decimal pl-4 space-y-2">
                  <li>Start by selecting a <strong>site</strong> from the dropdown above</li>
                  <li>Once a site is selected, choose a <strong>floor</strong> from the available options</li>
                  <li>Floor plans for the selected location will be displayed here</li>
                  <li>You can download floor plans using the download button</li>
                </ol>
                <div className="mt-4 pt-4 border-t border-blue-100">
                  <h4 className="text-xs font-medium text-blue-700 mb-1">Tip</h4>
                  <p className="text-xs text-blue-600">
                    If you need to add new floor plans, use the "Upload Floor Plan" tab.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FloorPlanViewer;
