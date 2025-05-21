
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface FloorPlanUploadProps {
  siteId: string;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ siteId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!name.trim()) {
      toast.error('Please enter a name for the floor plan');
      return;
    }

    if (!siteId) {
      toast.error('No site selected');
      return;
    }

    setUploading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${siteId}/${Date.now()}.${fileExt}`;
      
      // First check if storage is available
      const { data: buckets, error: bucketError } = await supabase
        .storage
        .listBuckets();
      
      if (bucketError) {
        console.error('Error checking storage buckets:', bucketError);
        toast.error('Error accessing storage');
        return;
      }
      
      // Check if floor_plans bucket exists
      let bucketName = 'floor_plans';
      const bucketExists = buckets.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        // If bucket doesn't exist, create it
        const { error: createError } = await supabase
          .storage
          .createBucket(bucketName, {
            public: false
          });
          
        if (createError) {
          console.error('Error creating storage bucket:', createError);
          toast.error('Error setting up storage');
          return;
        }
      }

      // Upload the file
      const { data, error } = await supabase
        .storage
        .from(bucketName)
        .upload(fileName, file);

      if (error) {
        throw new Error(error.message);
      }

      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from(bucketName)
        .getPublicUrl(fileName);

      // Create a record in the database
      const { error: dbError } = await supabase
        .from('site_floor_plans')
        .insert({
          site_id: siteId,
          name: name,
          file_path: publicUrlData.publicUrl,
          file_type: file.type,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast.success('Floor plan uploaded successfully');
      setFile(null);
      setName('');
    } catch (error) {
      console.error('Error uploading floor plan:', error);
      toast.error('Failed to upload floor plan');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload Floor Plan</h3>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="floor-plan-name">Floor Plan Name</Label>
          <Input 
            id="floor-plan-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Ground Floor, Level 1, etc."
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="floor-plan-file">Floor Plan File</Label>
          <FileInput
            id="floor-plan-file"
            onChange={handleFileChange}
            className="mt-1"
            accept=".pdf,.jpg,.jpeg,.png"
          />
          <p className="text-xs text-gray-500 mt-1">
            Accepted formats: PDF, JPG, PNG (Max 10MB)
          </p>
        </div>
        
        <div>
          <Button
            onClick={handleUpload}
            disabled={uploading || !file}
            className="w-full sm:w-auto"
          >
            {uploading ? (
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
    </div>
  );
};

export default FloorPlanUpload;
