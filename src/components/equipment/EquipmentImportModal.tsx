import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle, Info, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { equipmentCategories } from './EquipmentFormSchema';

interface EquipmentImportModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface SiteData {
  id: string;
  name: string;
}

const EquipmentImportModal: React.FC<EquipmentImportModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importedCount, setImportedCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [sites, setSites] = useState<SiteData[]>([]);
  const [selectedSite, setSelectedSite] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  
  React.useEffect(() => {
    const loadSites = async () => {
      try {
        const { data, error } = await supabase
          .from('business_sites')
          .select('id, name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setSites(data);
        }
      } catch (error) {
        console.error('Error loading sites:', error);
      }
    };
    
    loadSites();
  }, []);

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
    const validTypes = ['text/csv'];
    
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please select a CSV file');
      return;
    }
    
    setFile(selectedFile);
    setImportStatus('idle');
    setErrors([]);
    setDuplicateCount(0);
  };

  const parseFile = async (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
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
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  };
  
  const validateEquipmentData = (equipment: any): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!equipment.name) errors.push(`Missing name for equipment ${equipment.name || 'unknown'}`);
    if (!equipment.category) errors.push(`Missing category for equipment ${equipment.name || 'unknown'}`);
    if (!equipment.location) errors.push(`Missing location for equipment ${equipment.name || 'unknown'}`);
    if (!equipment.status) errors.push(`Missing status for equipment ${equipment.name || 'unknown'}`);
    
    if (equipment.status && !['operational', 'maintenance', 'inactive'].includes(equipment.status.toLowerCase())) {
      errors.push(`Invalid status for equipment ${equipment.name || 'unknown'}. Must be one of: operational, maintenance, inactive`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const checkForDuplicates = async (equipmentData: any, siteMap: Map<string, string>): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // We'll check by name and site_id as a unique combination
      const siteName = equipmentData.site_name || null;
      const siteId = siteName ? siteMap.get(siteName) : null;
      
      const { data, error } = await supabase
        .from('equipment')
        .select('id')
        .eq('name', equipmentData.name)
        .eq('owner_id', user.id)
        .eq(siteId ? 'site_id' : 'site_id', siteId);
      
      if (error) {
        console.error('Error checking for duplicates:', error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return false;
    }
  };

  const importEquipment = async () => {
    if (!file || !user || !selectedSite) return;
    
    try {
      setIsUploading(true);
      setImportStatus('loading');
      setErrors([]);
      setDuplicateCount(0);
      
      const parsedData = await parseFile(file);
      
      if (!parsedData.length) {
        throw new Error('No data found in file');
      }
      
      let successCount = 0;
      let duplicatesSkipped = 0;
      const errorMessages: string[] = [];
      const validEquipment = [];
      
      for (const equipmentData of parsedData) {
        const { isValid, errors } = validateEquipmentData(equipmentData);
        
        if (isValid) {
          // Check if this equipment already exists
          const isDuplicate = await checkForDuplicates(equipmentData, new Map());
          
          if (isDuplicate) {
            duplicatesSkipped++;
            errorMessages.push(`Skipped duplicate equipment: ${equipmentData.name}`);
            continue;
          }
          
          validEquipment.push({
            name: equipmentData.name,
            category: equipmentData.category,
            location: equipmentData.location,
            owner_id: user.id,
            site_id: selectedSite,
            status: equipmentData.status.toLowerCase(),
            serial_number: equipmentData.serial_number || null,
            manufacturer: equipmentData.manufacturer || null,
            model: equipmentData.model || null,
            purchase_date: equipmentData.purchase_date || null,
            warranty_expiry: equipmentData.warranty_expiry || null,
            next_service_date: equipmentData.next_service_date || null,
            notes: equipmentData.notes || null
          });
        } else {
          errorMessages.push(...errors);
        }
      }
      
      setDuplicateCount(duplicatesSkipped);
      
      if (validEquipment.length > 0) {
        const batchSize = 50;
        
        for (let i = 0; i < validEquipment.length; i += batchSize) {
          const batch = validEquipment.slice(i, i + batchSize);
          
          const { data, error } = await supabase
            .from('equipment')
            .insert(batch);
          
          if (error) {
            errorMessages.push(`Batch error: ${error.message}`);
          } else {
            successCount += batch.length;
          }
        }
      }
      
      setImportedCount(successCount);
      setErrors(errorMessages);
      
      if (errorMessages.length === 0 && duplicatesSkipped === 0) {
        toast.success(`Successfully imported ${successCount} equipment items`);
        setImportStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else if (successCount > 0) {
        const message = duplicatesSkipped > 0 
          ? `Imported ${successCount} equipment items. Skipped ${duplicatesSkipped} duplicates.`
          : `Imported ${successCount} equipment items with ${errorMessages.length} errors.`;
        
        toast.success(message);
        setImportStatus('success');
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setImportStatus('error');
        toast.error(duplicatesSkipped > 0 
          ? `All ${duplicatesSkipped} equipment items were duplicates. Nothing imported.` 
          : 'Import failed. Please check the errors and try again.');
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

  const sampleCsv = 'name,category,location,status,serial_number,manufacturer,model,purchase_date,warranty_expiry,next_service_date,notes\n' +
    'Office Laptop 1,IT Infrastructure,Reception,operational,SN48372,Dell,Latitude 5420,2023-01-15,2025-01-15,2023-07-15,Business laptop\n' +
    'Conference Room A/C,HVAC,Conference Room,operational,AC8834,Daikin,FTX50,2022-05-20,2027-05-20,2023-05-20,Wall-mounted unit\n' +
    'Warehouse Forklift,Machinery,Warehouse Area,maintenance,FL1234,Toyota,8FGU25,2021-03-10,2026-03-10,2023-06-10,Electric forklift needs maintenance\n' +
    'Retail Cash Register,POS,Front Desk,inactive,POS223,NCR,RealPOS 80XRT,2020-08-05,2023-08-05,2023-02-05,To be replaced\n' +
    'Server Rack #1,IT Infrastructure,Server Room,operational,SR445,HP,ProLiant DL380,2022-11-12,2027-11-12,2023-11-12,Main database server';

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sample_equipment_import.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Sample CSV downloaded');
  };

  return (
    <DialogContent className="sm:max-w-md p-0 w-full">
      <ScrollArea className="max-h-[80vh]">
        <div className="w-full bg-white rounded-lg">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle>Bulk Import Equipment</DialogTitle>
            <DialogDescription>
              Upload a CSV file with equipment information to bulk import items.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 p-4">
            <Alert variant="default" className="bg-forgemate-orange/10 border-forgemate-orange/20">
              <Info className="h-4 w-4 text-forgemate-orange" />
              <AlertTitle className="text-forgemate-orange font-medium">Required Fields</AlertTitle>
              <AlertDescription className="text-forgemate-orange">
                <p className="text-sm">Your file must contain these required fields:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li><strong>name</strong> - Equipment name (required)</li>
                  <li><strong>category</strong> - Equipment category (required) - Must be one of: {equipmentCategories.join(', ')}</li>
                  <li><strong>location</strong> - Location within site (required)</li>
                  <li><strong>status</strong> - operational, maintenance, or inactive (required)</li>
                </ul>
                <p className="text-sm mt-2">Optional fields:</p>
                <ul className="list-disc list-inside text-xs mt-1 space-y-1">
                  <li><strong>serial_number</strong> - Equipment serial number</li>
                  <li><strong>manufacturer</strong> - Equipment manufacturer</li>
                  <li><strong>model</strong> - Equipment model</li>
                  <li><strong>purchase_date</strong> - YYYY-MM-DD format</li>
                  <li><strong>warranty_expiry</strong> - YYYY-MM-DD format</li>
                  <li><strong>next_service_date</strong> - YYYY-MM-DD format</li>
                  <li><strong>notes</strong> - Additional notes about the equipment</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Site</label>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center ${
                isDragging ? 'border-forgemate-orange bg-forgemate-orange/10' : 'border-gray-300'
              } transition-colors cursor-pointer min-h-[120px] flex flex-col items-center justify-center`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileInput}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <p className="mt-2 text-sm font-medium">
                Drag & drop your file here or click to browse
              </p>
              <p className="mt-1 text-xs text-gray-500">
                Supports CSV format only
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
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-forgemate-orange"></div>
                <p className="mt-2 text-sm text-gray-600">Importing equipment...</p>
              </div>
            )}

            {importStatus === 'success' && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <div className="flex">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Import successful!</p>
                    <p className="text-sm text-green-700">
                      {importedCount} equipment items have been imported
                      {duplicateCount > 0 && `, ${duplicateCount} duplicates skipped`}
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
                className="bg-forgemate-orange hover:bg-forgemate-orange/90 text-white"
                onClick={importEquipment}
                disabled={!file || isUploading || importStatus === 'success' || !user || !selectedSite}
                size="sm"
              >
                <Upload className="h-4 w-4 mr-1" />
                Import Equipment
              </Button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
};

export default EquipmentImportModal;
