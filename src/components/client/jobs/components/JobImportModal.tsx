
import React, { useState } from 'react';
import { parse } from 'papaparse';
import { X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FileDropzone from '@/components/contractors/import/FileDropzone';
import ImportStatusDisplay from '@/components/contractors/import/ImportStatusDisplay';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface JobImportModalProps {
  open: boolean;
  onClose: () => void;
  onImportComplete?: () => void;
}

interface ValidationResult {
  success: number;
  failed: number;
  errors: string[];
  validData: any[];
}

interface ImportProgress {
  total: number;
  current: number;
  added: number;
  duplicates: number;
  failures: number;
}

const JobImportModal: React.FC<JobImportModalProps> = ({
  open,
  onClose,
  onImportComplete
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [importProgress, setImportProgress] = useState<ImportProgress>({
    total: 0,
    current: 0,
    added: 0,
    duplicates: 0,
    failures: 0
  });
  const [step, setStep] = useState<'upload' | 'validate' | 'import'>('upload');

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setValidationResult(null);
    setImportProgress({
      total: 0,
      current: 0,
      added: 0,
      duplicates: 0,
      failures: 0
    });
    setStep('validate');
  };

  const downloadSampleCsv = () => {
    const headers = ['title', 'description', 'service_type', 'priority', 'site', 'location_details', 'assigned_to', 'start_date', 'due_date', 'schedule_notes'];
    const sampleData = [
      ['Emergency Lighting Test', 'Check and test all emergency lighting', 'emergency-lighting', 'high', 'Main Office Building', 'All floors', 'ABC Electrical', '2023-06-15 09:00', '2023-06-15 17:00', 'Complete during business hours'],
      ['Annual Test & Tag', 'Annual test and tag of all electrical equipment', 'test-tag', 'medium', 'Warehouse Facility', 'Ground floor', 'XYZ Testing Services', '2023-07-01 08:00', '2023-07-03 16:00', 'Coordinate with warehouse manager']
    ];
    
    let csvContent = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'job_import_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const validateCsvData = async (data: any[]): Promise<ValidationResult> => {
    const errors: string[] = [];
    const validData: any[] = [];

    // Fetch existing sites for validation
    const { data: sites } = await supabase
      .from('business_sites')
      .select('id, name');
    
    const siteNameToIdMap = sites ? sites.reduce((map: any, site) => {
      map[site.name.toLowerCase()] = site.id;
      return map;
    }, {}) : {};

    // Fetch existing contractors for validation
    const { data: contractors } = await supabase
      .from('contractors')
      .select('id, name');
    
    const contractorNameMap = contractors ? contractors.reduce((map: any, contractor) => {
      map[contractor.name.toLowerCase()] = {
        id: contractor.id,
        exists: true
      };
      return map;
    }, {}) : {};

    // Validate each row
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 because of 0-indexing and header row
      const validationErrors = [];

      // Required fields
      if (!row.title) validationErrors.push(`Row ${rowNumber}: Missing title`);
      if (!row.service_type) validationErrors.push(`Row ${rowNumber}: Missing service type`);
      
      // Site validation
      if (row.site) {
        const siteId = siteNameToIdMap[row.site.toLowerCase()];
        if (!siteId) {
          validationErrors.push(`Row ${rowNumber}: Site "${row.site}" not found in database`);
        } else {
          row.site_id = siteId;
        }
      } else {
        validationErrors.push(`Row ${rowNumber}: Missing site`);
      }

      // Contractor validation - mark new contractors for creation
      if (row.assigned_to) {
        const contractorKey = row.assigned_to.toLowerCase();
        if (!contractorNameMap[contractorKey]) {
          contractorNameMap[contractorKey] = {
            id: null,
            exists: false,
            name: row.assigned_to,
            service_type: row.service_type || 'general'
          };
        }
      }

      // Date validation
      if (row.start_date && !/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(row.start_date)) {
        validationErrors.push(`Row ${rowNumber}: Invalid start date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM`);
      }
      
      if (row.due_date && !/^\d{4}-\d{2}-\d{2}( \d{2}:\d{2})?$/.test(row.due_date)) {
        validationErrors.push(`Row ${rowNumber}: Invalid due date format. Use YYYY-MM-DD or YYYY-MM-DD HH:MM`);
      }

      if (validationErrors.length > 0) {
        errors.push(...validationErrors);
      } else {
        validData.push({
          ...row,
          contractorRef: row.assigned_to ? row.assigned_to.toLowerCase() : null
        });
      }
    }

    // Add contractor references to context
    return {
      success: validData.length,
      failed: data.length - validData.length,
      errors,
      validData: validData.map(row => ({
        ...row,
        contractors: contractorNameMap
      }))
    };
  };

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    setIsValidating(true);
    
    try {
      parse(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const data = results.data as any[];
          
          if (data.length === 0) {
            toast.error('No data found in the CSV file');
            setValidationResult({
              success: 0,
              failed: 0,
              errors: ['No data found in the CSV file'],
              validData: []
            });
            return;
          }
          
          const validationResult = await validateCsvData(data);
          setValidationResult(validationResult);
          
          if (validationResult.failed > 0) {
            toast.warning(`Found ${validationResult.failed} invalid records. Please check the validation results.`);
          } else {
            toast.success(`Validation successful. ${validationResult.success} records ready to import.`);
          }
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
          setValidationResult({
            success: 0,
            failed: 1,
            errors: [`Error parsing CSV: ${error.message}`],
            validData: []
          });
        }
      });
    } catch (error: any) {
      toast.error(`Failed to process file: ${error.message}`);
    } finally {
      setIsValidating(false);
    }
  };

  const importJobs = async () => {
    if (!validationResult || validationResult.success === 0) return;
    
    setIsImporting(true);
    setStep('import');
    const total = validationResult.validData.length;
    
    try {
      // Record import data locally
      const importStartTime = new Date();
      let importId = `import-${importStartTime.getTime()}`;
      
      // First, ensure all referenced contractors exist
      const uniqueContractors = new Map();
      for (const row of validationResult.validData) {
        if (row.assigned_to && !row.contractors[row.contractorRef].exists) {
          uniqueContractors.set(row.contractorRef, {
            name: row.assigned_to,
            service_type: row.service_type || 'general',
            status: 'Active'
          });
        }
      }

      // Create new contractors if needed
      for (const [key, contractor] of uniqueContractors.entries()) {
        const { data, error } = await supabase
          .from('contractors')
          .insert(contractor)
          .select();
        
        if (error) {
          toast.error(`Failed to create contractor "${contractor.name}": ${error.message}`);
        } else if (data && data.length > 0) {
          // Update the contractor ID in our reference map
          for (const row of validationResult.validData) {
            if (row.contractors && row.contractorRef === key) {
              row.contractors[key].id = data[0].id;
              row.contractors[key].exists = true;
            }
          }
          
          toast.success(`Created new contractor: ${contractor.name}`);
        }
      }

      // Process each job
      let added = 0;
      let duplicates = 0;
      let failures = 0;

      for (let i = 0; i < validationResult.validData.length; i++) {
        const row = validationResult.validData[i];
        setImportProgress({
          total,
          current: i + 1,
          added,
          duplicates,
          failures
        });

        try {
          // Check for duplicates
          const { data: existing } = await supabase
            .from('jobs')
            .select('id')
            .eq('title', row.title)
            .eq('site_id', row.site_id);

          if (existing && existing.length > 0) {
            duplicates++;
            continue;
          }

          // Prepare job data
          const jobData = {
            title: row.title,
            description: row.description || null,
            service_type: row.service_type,
            priority: row.priority || 'medium',
            site_id: row.site_id,
            location_details: row.location_details || null,
            schedule_notes: row.schedule_notes || null,
            status: 'pending',
            created_by: (await supabase.auth.getUser()).data.user?.id
          };

          // Add start and due dates if provided
          if (row.start_date) {
            jobData['start_date'] = new Date(row.start_date).toISOString();
          }
          
          if (row.due_date) {
            jobData['due_date'] = new Date(row.due_date).toISOString();
          }

          // Add contractor reference if provided
          if (row.assigned_to && row.contractors && row.contractorRef) {
            const contractorRef = row.contractors[row.contractorRef];
            if (contractorRef && contractorRef.id) {
              jobData['contractor_id'] = contractorRef.id;
              jobData['assigned_to'] = row.assigned_to;
            }
          }

          // Create the job
          const { data, error } = await supabase
            .from('jobs')
            .insert(jobData)
            .select();

          if (error) {
            failures++;
            console.error('Failed to create job:', error);
          } else {
            added++;
          }
        } catch (error) {
          failures++;
          console.error('Error importing job:', error);
        }
      }

      toast.success(`Import complete: ${added} jobs added, ${duplicates} duplicates skipped, ${failures} failures`);
      
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
      console.error('Import error:', error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setImportProgress({
      total: 0,
      current: 0,
      added: 0,
      duplicates: 0,
      failures: 0
    });
    setStep('upload');
  };

  const calculateProgress = () => {
    if (!importProgress.total) return 0;
    return Math.floor((importProgress.current / importProgress.total) * 100);
  };

  const renderStepContent = () => {
    switch (step) {
      case 'upload':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                Upload a CSV file with job details to import in bulk.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCsv}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Template
              </Button>
            </div>

            <FileDropzone
              onFileSelected={handleFileSelected}
              selectedFile={selectedFile}
              accept=".csv"
              helpText="Drag & drop your CSV file here or click to browse"
              isLoading={isValidating}
            />
          </div>
        );
        
      case 'validate':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Data Validation</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={resetImport}
              >
                Change File
              </Button>
            </div>
            
            {selectedFile && (
              <div className="p-2 bg-gray-50 rounded border flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[80%]">{selectedFile.name}</span>
                <span className="text-xs text-gray-500">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            {!validationResult && !isValidating && (
              <Button
                onClick={handleValidate}
                disabled={!selectedFile || isValidating}
                className="w-full"
              >
                {isValidating ? 'Validating...' : 'Validate CSV'}
              </Button>
            )}

            {isValidating && (
              <div className="text-center py-2">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                <div className="mt-2">Validating your data...</div>
              </div>
            )}

            {validationResult && (
              <>
                <ImportStatusDisplay
                  validationResult={validationResult}
                  importProgress={isImporting ? calculateProgress() : undefined}
                  isImporting={isImporting}
                />

                {validationResult.success > 0 && !isImporting && (
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={resetImport}>
                      Cancel
                    </Button>
                    <Button
                      onClick={importJobs}
                      disabled={isImporting}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Import {validationResult.success} Jobs
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        );
        
      case 'import':
        return (
          <div className="space-y-4">
            <h3 className="font-medium">Importing Jobs</h3>
            
            <div className="p-2 bg-gray-50 rounded border flex justify-between items-center">
              <span className="font-medium text-sm">
                {isImporting ? 'Import in progress...' : 'Import complete'}
              </span>
            </div>
            
            <ImportStatusDisplay
              validationResult={validationResult}
              importProgress={calculateProgress()}
              isImporting={isImporting}
            />
            
            <div className="flex justify-between items-center">
              <div>
                {isImporting ? (
                  <p className="text-sm text-gray-600">
                    Importing {importProgress.current} of {importProgress.total} jobs...
                  </p>
                ) : (
                  <p className="text-sm text-gray-600">
                    Added: {importProgress.added} | 
                    Duplicates: {importProgress.duplicates} | 
                    Failures: {importProgress.failures}
                  </p>
                )}
              </div>
              
              {!isImporting && (
                <Button
                  onClick={onClose}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Done
                </Button>
              )}
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Import Jobs from CSV</span>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {renderStepContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobImportModal;
