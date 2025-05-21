import { supabase } from '@/integrations/supabase/client';
import { validateLicenseData } from './licenseValidator';
import Papa from 'papaparse';

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  duplicatesSkipped: number;
}

export const importLicenses = async (file: File, userId: string): Promise<ImportResult> => {
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

    // Parse CSV file
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // First get all available contractors from the database
          const { data: availableContractors, error: contractorsError } = await supabase
            .from('contractors')
            .select('name');
            
          if (contractorsError) {
            reject(new Error(`Error fetching contractors: ${contractorsError.message}`));
            return;
          }
          
          const validContractorNames = availableContractors?.map(c => c.name) || [];
          
          const licenses = normalizeData(results.data as Record<string, any>[]);
          
          if (licenses.length === 0) {
            reject(new Error('No valid licenses found in the file.'));
            return;
          }
          
          for (const license of licenses) {
            const validationResult = validateLicenseData(license);
            
            if (!validationResult.isValid) {
              result.errors = [...result.errors, ...validationResult.errors];
              continue;
            }
            
            // Check if contractor exists
            if (!validContractorNames.includes(license.contractor_name)) {
              result.errors.push(`Contractor "${license.contractor_name}" does not exist in the system. Please add this contractor first.`);
              continue;
            }
            
            // Format data for database insertion
            const licenseData = {
              contractor_id: userId,
              contractor_name: license.contractor_name,
              license_type: license.license_type,
              license_number: license.license_number,
              issue_date: license.issue_date,
              expiry_date: license.expiry_date,
              provider: license.provider,
              notes: license.notes || null,
              status: license.status || 'Valid',
              owner_id: userId
            };
            
            // Check for duplicates before inserting
            const { data: existingLicenses, error: checkError } = await supabase
              .from('contractor_licenses')
              .select('id')
              .eq('license_number', licenseData.license_number)
              .eq('contractor_name', licenseData.contractor_name);
              
            if (checkError) {
              result.errors.push(`Error checking for duplicate: ${checkError.message}`);
              continue;
            }
            
            if (existingLicenses && existingLicenses.length > 0) {
              result.duplicatesSkipped++;
              continue;
            }
            
            // Insert into database
            const { error: insertError } = await supabase
              .from('contractor_licenses')
              .insert(licenseData);
              
            if (insertError) {
              result.errors.push(`Error importing license for ${licenseData.contractor_name}: ${insertError.message}`);
            } else {
              result.importedCount++;
            }
          }
          
          // Consider the import successful if at least one license was imported
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
    
    // Map and normalize field names (handle different cases, spaces, etc.)
    Object.entries(item).forEach(([key, value]) => {
      const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      
      // Map common variations
      const mappedKey = {
        'name': 'contractor_name',
        'contractor': 'contractor_name',
        'company': 'contractor_name',
        'license': 'license_type',
        'number': 'license_number',
        'license_no': 'license_number',
        'license_#': 'license_number',
        'issue': 'issue_date',
        'expiry': 'expiry_date',
        'expiration': 'expiry_date',
        'expiration_date': 'expiry_date',
        'issuing_authority': 'provider',
        'issuer': 'provider',
        'note': 'notes',
        'comment': 'notes',
        'comments': 'notes',
      }[normalizedKey] || normalizedKey;
      
      normalized[mappedKey] = typeof value === 'string' ? value.trim() : value;
    });
    
    return normalized;
  });
};
