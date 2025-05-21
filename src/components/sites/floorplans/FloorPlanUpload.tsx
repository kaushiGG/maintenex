import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileInput } from '@/components/ui/file-input';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

interface FloorPlanUploadProps {
  siteId: string;
  onUploadSuccess?: () => void;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ siteId, onUploadSuccess }) => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlanName(e.target.value);
  };

  // Update the handleUpload function to use the correct bucket and file path format
  const handleUpload = async () => {
    try {
      setIsUploading(true);
      
      if (!selectedFile) {
        toast.error('Please select a file first.');
        setIsUploading(false);
        return;
      }
      
      // Generate a unique file path
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${siteId}_${uuidv4()}.${fileExt}`;
      const filePath = `${siteId}/${fileName}`;
      
      console.log(`Uploading to floorplans bucket with path: ${filePath}`);
      
      // Upload to the floorplans bucket
      const { error: uploadError } = await supabase.storage
        .from('floorplans')
        .upload(filePath, selectedFile);
        
      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Check if it's a bucket not found error
        if (uploadError.message.includes('not found') || uploadError.message.includes('does not exist')) {
          toast.error(
            'The floorplans storage bucket does not exist. Please create it in the Supabase dashboard.',
            { duration: 8000 }
          );
          return;
        }
        
        throw uploadError;
      }
      
      // Save the floor plan data in the database
      const { error: dbError } = await supabase
        .from('site_floor_plans')
        .insert({
          site_id: siteId,
          name: planName || selectedFile.name,
          file_path: filePath, // Store just the path, not the full URL
          file_type: fileExt,
          uploaded_by: user?.id
        });
        
      if (dbError) {
        console.error('Database error:', dbError);
        throw dbError;
      }
      
      toast.success('Floor plan uploaded successfully');
      setSelectedFile(null);
      setPlanName('');
      
      // Refresh the floor plans list
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      console.error('Error uploading floor plan:', error);
      toast.error(`Failed to upload floor plan: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="plan-name" className="text-sm">Plan Name (Optional)</Label>
        <Input
          type="text"
          id="plan-name"
          placeholder="Enter plan name"
          value={planName}
          onChange={handleNameChange}
        />
      </div>
      <div>
        <FileInput onFileChange={handleFileChange} />
      </div>
      <Button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? 'Uploading...' : 'Upload Floor Plan'}
      </Button>
    </div>
  );
};

export default FloorPlanUpload;
