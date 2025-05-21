import Papa from 'papaparse';
import { validateInsuranceData } from './insuranceValidator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InsuranceImportResult {
  success: number;
  failed: number;
  errors: string[];
  validatedData: any[];
}

export const validateInsuranceCSV = (file: File): Promise<InsuranceImportResult> => {
  return new Promise((resolve, reject) => {
    const result: InsuranceImportResult = {
      success: 0,
      failed: 0,
      errors: [],
      validatedData: []
    };

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const { data, errors: parseErrors } = results;
        
        if (parseErrors.length > 0) {
          parseErrors.forEach(error => {
            result.errors.push(`Row ${error.row}: ${error.message}`);
            result.failed++;
          });
        }

        for (const row of data as any[]) {
          const validation = validateInsuranceData(row);

          if (!validation.isValid) {
            result.failed++;
            validation.errors.forEach(error => {
              result.errors.push(error);
            });
            continue;
          }

          if (row.contractor_name) {
            const { data: contractorData, error: contractorError } = await supabase
              .from('contractors')
              .select('name')
              .eq('name', row.contractor_name)
              .single();

            if (contractorError || !contractorData) {
              result.failed++;
              result.errors.push(`Contractor '${row.contractor_name}' does not exist in the system. Please add the contractor first.`);
              continue;
            }
          }

          result.validatedData.push(row);
          result.success++;
        }

        resolve(result);
      },
      error: (error) => {
        result.errors.push(`File parsing error: ${error.message}`);
        reject(result);
      }
    });
  });
};

export const importInsurances = async (
  validatedData: any[],
  userId: string,
  onProgress?: (progress: number) => void
): Promise<{ success: number; failed: number; errors: string[]; duplicates: number }> => {
  const result = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    duplicates: 0
  };

  const totalItems = validatedData.length;

  for (let i = 0; i < validatedData.length; i++) {
    const insurance = validatedData[i];
    
    try {
      const { data: existingRecords } = await supabase
        .from('contractor_insurance')
        .select('id')
        .eq('contractor_name', insurance.contractor_name)
        .eq('policy_number', insurance.policy_number);

      if (existingRecords && existingRecords.length > 0) {
        result.duplicates++;
        continue;
      }

      const { error } = await supabase.from('contractor_insurance').insert({
        contractor_id: userId,
        contractor_name: insurance.contractor_name,
        insurance_type: insurance.insurance_type,
        provider: insurance.provider,
        policy_number: insurance.policy_number,
        coverage: insurance.coverage,
        issue_date: insurance.issue_date,
        expiry_date: insurance.expiry_date,
        notes: insurance.notes,
        status: insurance.status || 'Valid',
        owner_id: userId
      });

      if (error) {
        console.error('Error inserting insurance:', error);
        result.failed++;
        result.errors.push(`Failed to import insurance for ${insurance.contractor_name}: ${error.message}`);
      } else {
        result.success++;
      }
    } catch (error: any) {
      console.error('Exception inserting insurance:', error);
      result.failed++;
      result.errors.push(`Exception importing insurance for ${insurance.contractor_name}: ${error.message || error}`);
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalItems) * 100));
    }
  }

  return result;
};
