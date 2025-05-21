
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from "@/components/ui/scroll-area";
import FileDropzone from './import/FileDropzone';
import ImportRequirementsInfo from './import/InsuranceImportRequirementsInfo';
import { downloadSampleInsuranceCsv } from './utils/fileParser';
import { validateInsuranceCSV, importInsurances } from './utils/insuranceImport';
import ImportStatusDisplay from './import/ImportStatusDisplay';

interface InsuranceImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const InsuranceImportModal: React.FC<InsuranceImportModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [validationResult, setValidationResult] = useState<any>(undefined);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicatesSkipped, setDuplicatesSkipped] = useState(0);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImportStatus('idle');
    setErrors([]);
    setDuplicatesSkipped(0);
    setValidationResult(undefined);
  };

  const handleImportInsurances = async () => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      setImportStatus('loading');
      setErrors([]);
      setDuplicatesSkipped(0);
      
      // First validate the file
      const validationResult = await validateInsuranceCSV(file);
      setValidationResult(validationResult);
      
      if (validationResult.failed > 0) {
        setErrors(validationResult.errors || []);
        setImportStatus('error');
        toast.error(`Validation failed with ${validationResult.failed} errors.`);
        return;
      }
      
      // If validation passes, import the data
      const result = await importInsurances(
        validationResult.validatedData, 
        user.id,
        (progress) => {
          console.log(`Import progress: ${progress}%`);
          setImportProgress(progress);
        }
      );
      
      setImportedCount(result.success);
      setDuplicatesSkipped(result.duplicates); // Now properly typed
      setErrors(result.errors || []);
      
      if (result.success > 0) {
        const message = result.failed > 0 
          ? `Successfully imported ${result.success} insurance records. ${result.failed} records had errors.`
          : `Successfully imported ${result.success} insurance records.`;
        toast.success(message);
        setImportStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        toast.error(`Failed to import insurance records.`);
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
            <DialogTitle>Import Insurance Records</DialogTitle>
            <DialogDescription>
              Upload a CSV file with insurance information to bulk import contractor insurance data.
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
                onClick={downloadSampleInsuranceCsv}
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
              validationResult={validationResult}
              importProgress={importProgress}
              isImporting={isUploading}
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
                onClick={handleImportInsurances}
                disabled={!file || isUploading || importStatus === 'success' || !user}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import Insurance Records
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};

export default InsuranceImportModal;
