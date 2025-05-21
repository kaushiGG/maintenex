import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle, Info, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Site } from '@/types/site';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SiteImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const SiteImportModal: React.FC<SiteImportModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'update'>('skip');
  const [duplicatesFound, setDuplicatesFound] = useState(0);

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
    const validTypes = ['application/json', 'text/csv'];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select a CSV or JSON file');
      return;
    }
    
    setFile(selectedFile);
    setImportStatus('idle');
    setErrors([]);
    setDuplicatesFound(0);
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          if (file.type === 'application/json') {
            const data = JSON.parse(content);
            resolve(Array.isArray(data) ? data : [data]);
          } else if (file.type === 'text/csv') {
            const rows = content.split('\n');
            const headers = rows[0].split(',').map(header => header.trim());
            
            const data = rows.slice(1).filter(row => row.trim()).map(row => {
              const values = row.split(',').map(value => value.trim());
              return headers.reduce((obj, header, index) => {
                obj[header] = values[index] || '';
                return obj;
              }, {} as Record<string, string>);
            });
            
            resolve(data);
          } else {
            reject(new Error('Unsupported file type'));
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      
      if (file.type === 'application/json') {
        reader.readAsText(file);
      } else if (file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reject(new Error('Unsupported file type'));
      }
    });
  };
  
  const validateSiteData = (site: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!site.name) errors.push(`Missing name for site ${site.name || 'unknown'}`);
    if (!site.address) errors.push(`Missing address for site ${site.name || 'unknown'}`);
    
    if (site.compliance_status && !['compliant', 'warning', 'non-compliant', 'pending'].includes(site.compliance_status)) {
      errors.push(`Invalid compliance_status for site ${site.name || 'unknown'}. Must be one of: compliant, warning, non-compliant, pending`);
    }
    
    if (site.site_type && typeof site.site_type !== 'string') {
      errors.push(`Invalid site_type for site ${site.name || 'unknown'}. Must be a string`);
    }
    
    if (site.contact_email && !/\S+@\S+\.\S+/.test(site.contact_email)) {
      errors.push(`Invalid contact_email for site ${site.name || 'unknown'}`);
    }
    
    if (site.contact_phone && typeof site.contact_phone !== 'string') {
      errors.push(`Invalid contact_phone for site ${site.name || 'unknown'}. Must be a string`);
    }
    
    if (site.item_count && (isNaN(Number(site.item_count)) || Number(site.item_count) < 0)) {
      errors.push(`Invalid item_count for site ${site.name || 'unknown'}. Must be a number >= 0`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const checkForDuplicates = async (sites: any[]): Promise<{ 
    duplicates: any[], 
    newRecords: any[] 
  }> => {
    const duplicates: any[] = [];
    const newRecords: any[] = [];
    
    for (const site of sites) {
      const { data, error } = await supabase
        .from('business_sites')
        .select('id, name, address')
        .eq('name', site.name)
        .eq('address', site.address)
        .limit(1);
      
      if (error) {
        console.error('Error checking for duplicates:', error);
        newRecords.push(site);
      } else if (data && data.length > 0) {
        site.existingId = data[0].id;
        duplicates.push(site);
      } else {
        newRecords.push(site);
      }
    }
    
    return { duplicates, newRecords };
  };

  const importSites = async () => {
    if (!file || !user) return;
    
    try {
      setIsUploading(true);
      setImportStatus('loading');
      setErrors([]);
      
      const parsedData = await parseFile(file);
      
      if (!parsedData.length) {
        throw new Error('No data found in file');
      }
      
      const { duplicates, newRecords } = await checkForDuplicates(parsedData);
      setDuplicatesFound(duplicates.length);
      
      let successCount = 0;
      const errorMessages: string[] = [];
      
      if (newRecords.length > 0) {
        const validSites = [];
        
        for (const siteData of newRecords) {
          const { isValid, errors } = validateSiteData(siteData);
          
          if (isValid) {
            validSites.push({
              name: siteData.name,
              address: siteData.address,
              owner_id: user.id,
              compliance_status: siteData.compliance_status || 'pending',
              coordinates: siteData.coordinates || null,
              site_type: siteData.site_type || 'office',
              contact_email: siteData.contact_email || null,
              contact_phone: siteData.contact_phone || null,
              notes: siteData.notes || null,
              item_count: parseInt(siteData.item_count) || 0
            });
          } else {
            errorMessages.push(...errors);
          }
        }
        
        if (validSites.length > 0) {
          const { data, error } = await supabase
            .from('business_sites')
            .insert(validSites);
          
          if (error) {
            errorMessages.push(`Batch error: ${error.message}`);
          } else {
            successCount += validSites.length;
          }
        }
      }
      
      if (duplicates.length > 0 && duplicateHandling === 'update') {
        const updatedCount = await handleDuplicateUpdates(duplicates, user.id, errorMessages);
        successCount += updatedCount;
      }
      
      setImportedCount(successCount);
      setErrors(errorMessages);
      
      if (errorMessages.length === 0) {
        if (duplicates.length > 0 && duplicateHandling === 'skip') {
          toast.success(`Imported ${successCount} sites and skipped ${duplicates.length} duplicates`);
        } else {
          toast.success(`Successfully imported/updated ${successCount} sites`);
        }
        setImportStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setImportStatus('error');
        if (duplicates.length > 0 && duplicateHandling === 'skip') {
          toast.error(`Imported ${successCount} sites, skipped ${duplicates.length} duplicates, with ${errorMessages.length} errors`);
        } else {
          toast.error(`Imported/updated ${successCount} sites with ${errorMessages.length} errors`);
        }
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
  
  const handleDuplicateUpdates = async (
    duplicates: any[], 
    userId: string,
    errorMessages: string[]
  ): Promise<number> => {
    let updatedCount = 0;
    
    for (const site of duplicates) {
      const { isValid, errors } = validateSiteData(site);
      
      if (!isValid) {
        errorMessages.push(...errors);
        continue;
      }
      
      const { error } = await supabase
        .from('business_sites')
        .update({
          compliance_status: site.compliance_status || 'pending',
          coordinates: site.coordinates || null,
          site_type: site.site_type || 'office',
          contact_email: site.contact_email || null,
          contact_phone: site.contact_phone || null,
          notes: site.notes || null,
          item_count: parseInt(site.item_count) || 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', site.existingId);
      
      if (error) {
        errorMessages.push(`Update error for ${site.name}: ${error.message}`);
      } else {
        updatedCount++;
      }
    }
    
    return updatedCount;
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const sampleCsv = 'name,address,site_type,compliance_status,contact_email,contact_phone,notes,item_count\n' +
    'Headquarters,123 Main Street New York NY 10001,office,compliant,hq@example.com,212-555-0123,"Main corporate office",12\n' +
    'Downtown Branch,456 Market Ave San Francisco CA 94105,office,compliant,downtown@example.com,415-555-0189,"Downtown location",8\n' +
    'Warehouse East,789 Industrial Ave Chicago IL 60607,warehouse,pending,warehouse@example.com,312-555-0199,"Regional distribution center",42\n' +
    'Retail Store #12,101 Shopping Mall Rd Houston TX 77001,retail,warning,store12@example.com,713-555-0134,"High traffic location",25\n' +
    'Data Center,255 Server Lane Austin TX 78701,office,non-compliant,dc@example.com,512-555-0178,"Primary data center",36';

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sample_sites_import.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Sample CSV downloaded');
  };

  return (
    <DialogContent className="sm:max-w-md p-0 max-h-[90vh]">
      <ScrollArea className="max-h-[80vh]">
        <div className="w-full bg-white rounded-lg">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Import Sites</DialogTitle>
            <DialogDescription>
              Upload a CSV file with site information to bulk import sites.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <Alert variant="default" className="bg-blue-50 border-blue-200">
              <Info className="h-4 w-4 text-blue-500" />
              <AlertTitle className="text-blue-700 font-medium">Required Fields</AlertTitle>
              <AlertDescription className="text-blue-700">
                <p className="text-sm">Your file must contain these required fields:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li><strong>name</strong> - Site name (required)</li>
                  <li><strong>address</strong> - Site address (required)</li>
                </ul>
                <p className="text-sm mt-2">Optional fields:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li><strong>site_type</strong> - e.g., office, warehouse (defaults to "office")</li>
                  <li><strong>compliance_status</strong> - compliant, warning, non-compliant, pending (defaults to "pending")</li>
                  <li><strong>contact_email</strong> - Site contact email</li>
                  <li><strong>contact_phone</strong> - Site contact phone number</li>
                  <li><strong>notes</strong> - Additional site notes</li>
                  <li><strong>item_count</strong> - Number of items at site (defaults to 0)</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragging ? 'border-[#7851CA] bg-[#7851CA]/10' : 'border-gray-300'
              } transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.csv"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Drag & drop your file here or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports CSV and JSON formats
              </p>
            </div>
            
            {file && (
              <div className="p-2 bg-gray-50 rounded border flex justify-between items-center">
                <span className="font-medium text-sm truncate max-w-[80%]">{file.name}</span>
                <span className="text-xs text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
              </div>
            )}

            <div className="p-3 bg-gray-50 rounded border">
              <h3 className="text-sm font-medium mb-2">Duplicate record handling:</h3>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={duplicateHandling === 'skip'} 
                    onChange={() => setDuplicateHandling('skip')} 
                    className="h-4 w-4 text-[#7851CA] focus:ring-[#7851CA]" 
                  />
                  <span className="text-sm">Skip duplicates</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={duplicateHandling === 'update'} 
                    onChange={() => setDuplicateHandling('update')} 
                    className="h-4 w-4 text-[#7851CA] focus:ring-[#7851CA]" 
                  />
                  <span className="text-sm">Update existing records</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Duplicate detection is based on matching both site name and address
              </p>
            </div>

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

            {importStatus === 'loading' && (
              <div className="flex flex-col items-center justify-center p-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#7851CA]"></div>
                <p className="mt-2 text-sm text-gray-600">Importing sites...</p>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Import successful!</p>
                    <p className="text-sm text-green-700">
                      {duplicatesFound > 0 && duplicateHandling === 'skip' ? 
                        `${importedCount} sites have been imported, ${duplicatesFound} duplicates skipped` : 
                        `${importedCount} sites have been imported/updated`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {importStatus === 'error' && errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">Import errors</p>
                    <div className="max-h-28 overflow-y-auto">
                      {errors.length > 3 ? (
                        <div>
                          <ul className="list-disc list-inside text-xs text-red-700">
                            {errors.slice(0, 3).map((error, i) => (
                              <li key={i} className="break-words">{error}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-red-700 mt-1">
                            ...and {errors.length - 3} more errors
                          </p>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside text-xs text-red-700">
                          {errors.map((error, i) => (
                            <li key={i} className="break-words">{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white"
                onClick={importSites}
                disabled={!file || isUploading || importStatus === 'success' || !user}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import Sites
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};

export default SiteImportModal;
