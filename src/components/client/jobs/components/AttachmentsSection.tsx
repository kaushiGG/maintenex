import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { X, Paperclip } from 'lucide-react';

interface AttachmentsSectionProps {
  jobData: {
    attachments: File[];
  };
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVideoUpload: (file: File | null) => void;
  handleRemoveFile: (index: number) => void;
}

const AttachmentsSection: React.FC<AttachmentsSectionProps> = ({
  jobData,
  handleFileChange,
  handleVideoUpload,
  handleRemoveFile
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Attachments</h3>
      
      <div className="form-group">
        <Label>Upload Relevant Files</Label>
        <Input 
          type="file" 
          className="mt-1" 
          onChange={handleFileChange} 
          multiple
        />
        <div className="mt-1 text-xs text-gray-500">
          Upload photos, documents, or other files that may help with the job (Max 5MB per file)
        </div>
        
        {jobData.attachments.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
            <div className="space-y-2">
              {jobData.attachments.map((file, index) => (
                <div key={index} className="p-2 bg-gray-100 rounded flex items-center justify-between">
                  <div className="flex items-center">
                    <Paperclip className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="text-sm">{file.name}</span>
                    <span className="ml-2 text-xs text-gray-500">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(index)}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentsSection;
