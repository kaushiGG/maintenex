
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import FileDropzone from './import/FileDropzone';
import ImportStatusDisplay from './import/ImportStatusDisplay';
import ImportRequirementsInfo from './import/ImportRequirementsInfo';
import { downloadSampleCsv } from './utils/fileParser';
import { importContractors } from './utils/contractorImport';

interface ContractorImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const ContractorImportModal: React.FC<ContractorImportModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicatesSkipped, setDuplicatesSkipped] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImportStatus('idle');
    setErrors([]);
    setDuplicatesSkipped(0);
  };

  const handleImportContractors = async () => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      setImportStatus('loading');
      setErrors([]);
      setDuplicatesSkipped(0);
      
      const result = await importContractors(file, user.id);
      
      setImportedCount(result.importedCount);
      setDuplicatesSkipped(result.duplicatesSkipped);
      setErrors(result.errors);
      
      if (result.success) {
        const message = result.duplicatesSkipped > 0 
          ? `Successfully imported ${result.importedCount} contractors. Skipped ${result.duplicatesSkipped} duplicates.`
          : `Successfully imported ${result.importedCount} contractors.`;
        toast.success(message);
        setImportStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        const message = result.duplicatesSkipped > 0 
          ? `Imported ${result.importedCount} contractors, skipped ${result.duplicatesSkipped} duplicates with ${result.errors.length} errors.`
          : `Imported ${result.importedCount} contractors with ${result.errors.length} errors.`;
        toast.error(message);
        setImportStatus('error');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      setImportStatus('error');
      setErrors([`Import failed: ${error.message}`]);
      toast.error('Import failed. Please check the file format and try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md p-0 max-h-[90vh]">
      <ScrollArea className="max-h-[80vh]">
        <div className="w-full bg-white rounded-lg">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Import Contractors</DialogTitle>
            <DialogDescription>
              Upload a CSV file with contractor information to bulk import contractors.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <ImportRequirementsInfo />
            
            <FileDropzone onFileSelected={handleFileSelect} />
            
            {file && (
              <div className="p-2 bg-gray-50 rounded border flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[80%]">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            <div className="flex justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="flex items-center text-xs gap-1"
              >
                <Download className="h-3 w-3" /> Download CSV template
              </Button>
            </div>

            <ImportStatusDisplay 
              status={importStatus} 
              importedCount={importedCount} 
              errors={errors} 
              duplicatesSkipped={duplicatesSkipped} 
            />

            <Separator className="my-2" />

            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isUploading}
                size="sm"
              >
                Cancel
              </Button>
              <Button 
                variant="default"
                className="bg-[#7851CA] hover:bg-[#6a46b5] text-white"
                onClick={handleImportContractors}
                disabled={!file || isUploading || importStatus === 'success' || !user}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import Contractors
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};

export default ContractorImportModal;
