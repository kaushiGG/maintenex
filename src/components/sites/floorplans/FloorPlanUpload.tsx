
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileInput } from '@/components/ui/file-input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface FloorPlanUploadProps {
  siteId?: string;
  onFloorPlanUploaded?: (floorPlan: any) => void;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ 
  siteId,
  onFloorPlanUploaded
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [floorPlanName, setFloorPlanName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
        setError('Please select an image or PDF file');
        setSelectedFile(null);
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setSelectedFile(null);
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      // Use the file name as the default plan name if the user hasn't already set one
      if (!floorPlanName) {
        const fileName = file.name.split('.')[0];
        setFloorPlanName(fileName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }
    
    if (!floorPlanName) {
      setError('Please enter a name for the floor plan');
      return;
    }
    
    if (!siteId) {
      setError('No site selected');
      return;
    }
    
    setIsUploading(true);
    setError(null);
    
    try {
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `floor-plans/${fileName}`;
      
      // Create a URL for the file using the client URL
      const publicUrl = `${window.location.origin}/lovable-uploads/${fileName}`;
      
      // In a real app, you'd upload to Storage:
      // const { error: uploadError } = await supabase.storage
      //  .from('floor-plans')
      //  .upload(filePath, selectedFile);
      
      // For this demo, we'll just simulate a successful upload
      // and store the metadata in the database
      
      const { data: floorPlan, error: dbError } = await supabase
        .from('site_floor_plans')
        .insert({
          name: floorPlanName,
          file_path: publicUrl,
          site_id: siteId,
          file_type: selectedFile.type
        })
        .select()
        .single();
        
      if (dbError) {
        throw dbError;
      }
      
      toast.success('Floor plan uploaded successfully');
      
      if (onFloorPlanUploaded && floorPlan) {
        onFloorPlanUploaded(floorPlan);
      }
      
      // Clear the form
      setFloorPlanName('');
      setSelectedFile(null);
      
      // Reset the file input by creating a new key
      // This is a React hack to reset the file input
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <span className="animate-spin mr-2">⏳</span>
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
  );
};

export default FloorPlanUpload;
