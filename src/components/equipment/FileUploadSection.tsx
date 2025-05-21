import React, { useRef, useState } from 'react';
import { File, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { uploadFile, UploadedFile, deleteFile, ensureBucketPermissions } from '@/utils/fileUpload';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadSectionProps {
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  isUploading: boolean;
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>;
  user: any;
}

const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  uploadedFiles,
  setUploadedFiles,
  isUploading,
  setIsUploading,
  user
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateFile = (file: File): { valid: boolean; message?: string } => {
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { 
        valid: false, 
        message: `File is too large (${(file.size / (1024 * 1024)).toFixed(2)}MB). Maximum size is 5MB.`
      };
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        message: `File type "${file.type}" not supported. Please upload a PNG, JPG, or PDF file.`
      };
    }
    
    return { valid: true };
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    const file = e.target.files[0];
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message || "Invalid file");
      return;
    }

    setIsUploading(true);
    try {
      // Ensure bucket exists
      const bucketReady = await ensureBucketPermissions('equipments');
      if (!bucketReady) {
        toast.error("Storage is not ready. Please try again.");
        return;
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('equipments')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error("Failed to upload file: " + error.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('equipments')
        .getPublicUrl(filePath);

      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        path: filePath
      };

      setUploadedFiles(prev => [...prev, newFile]);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file: " + error.message);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileDelete = async (file: UploadedFile) => {
    if (!user) {
      toast.error("You must be logged in to delete files");
      return;
    }

    try {
      const { error } = await supabase.storage
        .from('equipments')
        .remove([file.path]);

      if (error) {
        console.error('Error deleting file:', error);
        toast.error("Failed to delete file: " + error.message);
        return;
      }

      setUploadedFiles(prev => prev.filter(f => f.path !== file.path));
      toast.success("File deleted successfully");
    } catch (error: any) {
      console.error('Error deleting file:', error);
      toast.error("Failed to delete file: " + error.message);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    if (!user) {
      toast.error("You must be logged in to upload files");
      return;
    }

    const file = e.dataTransfer.files[0];
    const validation = validateFile(file);
    if (!validation.valid) {
      toast.error(validation.message || "Invalid file");
      return;
    }

    setIsUploading(true);
    try {
      // Ensure bucket exists
      const bucketReady = await ensureBucketPermissions('equipments');
      if (!bucketReady) {
        toast.error("Storage is not ready. Please try again.");
        return;
      }

      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('equipments')
        .upload(filePath, file);

      if (error) {
        console.error('Error uploading file:', error);
        toast.error("Failed to upload file: " + error.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('equipments')
        .getPublicUrl(filePath);

      const newFile: UploadedFile = {
        name: file.name,
        type: file.type,
        size: file.size,
        url: publicUrl,
        path: filePath
      };

      setUploadedFiles(prev => [...prev, newFile]);
      toast.success("File uploaded successfully");
    } catch (error: any) {
      console.error('Error uploading file:', error);
      toast.error("Failed to upload file: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = async (fileToRemove: UploadedFile) => {
    try {
      console.log(`Removing file: ${fileToRemove.name} (path: ${fileToRemove.path})`);
      
      // Delete file from storage
      const deleted = await deleteFile(fileToRemove.path, 'equipments');
      
      if (deleted) {
        // Filter out the removed file
        setUploadedFiles(prev => prev.filter(file => file.path !== fileToRemove.path));
        toast.success(`File "${fileToRemove.name}" removed`);
      } else {
        toast.error(`Failed to remove "${fileToRemove.name}"`);
      }
    } catch (error: any) {
      console.error("Error removing file:", error);
      toast.error(`Failed to remove file: ${error.message || "Unknown error"}`);
    }
  };

  return (
    <div className="md:col-span-2 mt-3">
      <h3 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center">
        <File className="mr-1 h-4 w-4" />
        Documentation & Images
      </h3>
      
      {/* Hidden file input */}
      <input 
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".png,.jpg,.jpeg,.pdf"
      />
      
      <div 
        className={`border-2 border-dashed rounded-md p-6 text-center transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={!isUploading ? handleBrowseClick : undefined}
      >
        <Upload className={`h-8 w-8 mx-auto ${isDragging ? 'text-blue-500' : 'text-muted-foreground'}`} />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragging ? 'Drop file here' : 'Drag and drop equipment image or documentation'}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBrowseClick();
          }}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Browse Files'}
        </Button>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports: PNG, JPG, PDF up to 5MB
        </p>
      </div>
      
      {/* Show uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium">Uploaded Files:</h4>
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((file, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="flex items-center gap-1 py-1 px-2"
              >
                <File className="h-3 w-3" />
                <span className="truncate max-w-[150px]">{file.name}</span>
                <button
                  type="button"
                  className="ml-1 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveFile(file)}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;
