
import React, { useState, useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileSelected: (file: File) => void;
  selectedFile?: File | null;
  accept?: string;
  isLoading?: boolean;
  helpText?: string;
  icon?: React.ReactNode;
}

const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFileSelected, 
  selectedFile = null,
  accept = ".json,.csv",
  isLoading = false,
  helpText = "Drag & drop your file here or click to browse",
  icon
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    const validTypes = accept.split(',').map(type => type.trim());
    
    if (selectedFile.name.toLowerCase().endsWith('.csv') && accept.includes('.csv')) {
      onFileSelected(selectedFile);
      return;
    }
    
    if (!validTypes.some(type => selectedFile.type === type)) {
      return;
    }
    
    onFileSelected(selectedFile);
  };

  const triggerFileInput = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-4 text-center ${
        isDragging ? 'border-[#7851CA] bg-[#7851CA]/10' : 'border-gray-300'
      } transition-colors ${isLoading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'} min-h-[120px] flex flex-col items-center justify-center`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={triggerFileInput}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileInputChange}
        disabled={isLoading}
      />
      {icon || <Upload className="h-8 w-8 mx-auto text-gray-400" />}
      <p className="mt-2 text-sm font-medium">
        {isLoading ? "Processing..." : helpText}
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supports {accept.replace(/\./g, "").toUpperCase()} formats
      </p>
    </div>
  );
};

export default FileDropzone;
