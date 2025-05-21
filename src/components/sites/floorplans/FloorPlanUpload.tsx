
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Upload, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FloorPlanUploadProps {
  siteId?: string;
  onFloorPlanUploaded?: (floorPlan: any) => void;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ siteId, onFloorPlanUploaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Auto-fill the plan name from the file name (without extension)
      const fileName = e.target.files[0].name;
      setPlanName(fileName.split('.')[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!planName.trim()) {
      toast.error('Please enter a name for the floor plan');
      return;
    }

    if (!siteId) {
      toast.error('No site selected for floor plan upload');
      return;
    }

    setIsUploading(true);

    try {
      // For now, just simulate the upload success
      // In a real implementation, you would upload to Supabase Storage
      
      // Example code for uploading to Supabase Storage:
      // const filePath = `floor-plans/${siteId}/${Date.now()}_${file.name}`;
      // const { data, error } = await supabase.storage
      //   .from('site-floor-plans')
      //   .upload(filePath, file);
      
      // if (error) throw error;
      
      // Store the floor plan metadata in the database
      const { data, error } = await supabase
        .from('site_floor_plans')
        .insert({
          site_id: siteId,
          name: planName,
          file_path: `placeholder_path_${Date.now()}`, // Replace with actual path when implementing file upload
          file_type: file.type
        })
        .select()
        .single();
        
      if (error) throw error;

      toast.success('Floor plan uploaded successfully');
      
      if (onFloorPlanUploaded && data) {
        onFloorPlanUploaded(data);
      }
      
      // Reset form
      setFile(null);
      setPlanName('');
      
    } catch (error: any) {
      console.error('Floor plan upload error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Upload Floor Plan</h2>
        <p className="text-sm text-gray-500">
          Upload floor plans for your site to help with equipment management and service planning.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="planName">Floor Plan Name</Label>
          <Input
            id="planName"
            placeholder="e.g., First Floor, Main Building"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
        </div>
        
        <div>
          <Label htmlFor="floorPlan">Select File</Label>
          <div className="mt-1">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 text-gray-500 mb-2" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  PDF, PNG, JPG or SVG (max. 10MB)
                </p>
              </div>
              <input
                id="floorPlan"
                type="file"
                className="hidden"
                accept=".pdf,.png,.jpg,.jpeg,.svg"
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </label>
          </div>
          
          {file && (
            <div className="mt-2 flex items-center p-2 bg-blue-50 rounded-md">
              <File className="h-4 w-4 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700 truncate">{file.name}</span>
              <span className="text-xs text-gray-500 ml-2">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          )}
        </div>
        
        <Button
          onClick={handleUpload}
          disabled={isUploading || !file}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Floor Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FloorPlanUpload;
