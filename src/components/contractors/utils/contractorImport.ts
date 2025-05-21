
import { supabase } from '@/integrations/supabase/client';
import { validateContractorData } from './contractorValidator';
import Papa from 'papaparse';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  duplicatesSkipped: number;
}

export const importContractors = async (file: File, userId: string): Promise<ImportResult> => {
  return new Promise((resolve, reject) => {
    const result: ImportResult = {
      success: true,
      importedCount: 0,
      errors: [],
      duplicatesSkipped: 0
    };

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error('File is too large. Maximum size is 5MB.'));
      return;
    }

    // Parse the file using Papa Parse for CSV
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const contractors = normalizeData(results.data as Record<string, any>[]);
          
          if (contractors.length === 0) {
            reject(new Error('No valid contractors found in the file.'));
            return;
          }
          
          for (const contractor of contractors) {
            const validationResult = validateContractorData(contractor);
            
            if (!validationResult.isValid) {
              result.errors = [...result.errors, ...validationResult.errors];
              continue;
            }
            
            // Format data for database insertion
            const contractorData = {
              name: contractor.name,
              service_type: contractor.service_type,
              status: contractor.status || 'Active',
              contact_email: contractor.contact_email || null,
              contact_phone: contractor.contact_phone || null,
              location: contractor.location || null,
              notes: contractor.notes || null,
              credentials: contractor.credentials || null,
              rating: contractor.rating ? parseInt(contractor.rating) : null,
              owner_id: userId
            };
            
            // Check for duplicates before inserting
            const { data: existingContractors, error: checkError } = await supabase
              .from('contractors')
              .select('id')
              .eq('name', contractorData.name)
              .eq('service_type', contractorData.service_type);
              
            if (checkError) {
              result.errors.push(`Error checking for duplicate: ${checkError.message}`);
              continue;
            }
            
            if (existingContractors && existingContractors.length > 0) {
              result.duplicatesSkipped++;
              continue;
            }
            
            // Insert into database
            const { error: insertError } = await supabase
              .from('contractors')
              .insert(contractorData);
              
            if (insertError) {
              result.errors.push(`Error importing ${contractorData.name}: ${insertError.message}`);
            } else {
              result.importedCount++;
            }
          }
          
          // Consider the import successful if at least one contractor was imported
          result.success = result.importedCount > 0;
          resolve(result);
          
        } catch (error: any) {
          reject(error);
        }
      },
      error: (error) => {
        reject(new Error(`CSV parsing error: ${error.message}`));
      }
    });
  });
};

const normalizeData = (data: Record<string, any>[]): Record<string, any>[] => {
  return data.map(item => {
    const normalized: Record<string, any> = {};
    
    // Map and normalize field names
    Object.entries(item).forEach(([key, value]) => {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Map common variations
      const mappedKey = {
        'contractor_name': 'name',
        'service': 'service_type',
        'type': 'service_type',
        'email': 'contact_email',
        'phone': 'contact_phone',
        'address': 'location',
        'note': 'notes',
        'comment': 'notes',
        'comments': 'notes',
        'credential': 'credentials',
      }[normalizedKey] || normalizedKey;
      
      normalized[mappedKey] = typeof value === 'string' ? value.trim() : value;
    });
    
    return normalized;
  });
};
