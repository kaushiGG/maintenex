
import { supabase } from '@/integrations/supabase/client';

// Function to download sample CSV for contractors
export const downloadSampleCsv = () => {
  const headers = ['name', 'service_type', 'status', 'contact_email', 'contact_phone', 'location', 'notes', 'credentials', 'rating'];
  const sampleData = [
    ['ABC Electrical', 'Electrical', 'Active', 'contact@abcelectrical.com', '555-123-4567', 'New York', 'Reliable contractor', 'Licensed Electrician', '4'],
    ['XYZ Plumbing', 'Plumbing', 'Active', 'info@xyzplumbing.com', '555-987-6543', 'Los Angeles', 'Available weekends', 'Master Plumber', '5']
  ];
  
  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.join(',') + '\n';
  });
  
  downloadCsv(csvContent, 'contractor_import_template.csv');
};

// Function to download sample CSV for licenses with actual contractor names
export const downloadSampleLicenseCsv = async () => {
  // Get actual contractors from the database
  const { data: contractors, error } = await supabase
    .from('contractors')
    .select('name')
    .limit(3);
  
  if (error || !contractors || contractors.length === 0) {
    // Fallback if no contractors found
    const headers = ['contractor_name', 'license_type', 'license_number', 'issue_date', 'expiry_date', 'provider', 'notes', 'status'];
    const sampleData = [
      ['No contractors found - Please add contractors first', 'Electrical', 'EL-12345', '2023-01-15', '2025-01-14', 'State Board', 'Add contractors before importing licenses', 'Valid']
    ];
    
    let csvContent = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    downloadCsv(csvContent, 'license_import_template.csv');
    return;
  }
  
  // Create sample data with actual contractor names
  const headers = ['contractor_name', 'license_type', 'license_number', 'issue_date', 'expiry_date', 'provider', 'notes', 'status'];
  const sampleData = contractors.map((contractor, index) => {
    const licenseTypes = ['Electrical', 'Plumbing', 'General'];
    const providers = ['State Board', 'City Authority', 'Regional Authority'];
    const licensePrefix = ['EL', 'PL', 'GC'];
    
    return [
      contractor.name,
      licenseTypes[index % licenseTypes.length],
      `${licensePrefix[index % licensePrefix.length]}-${10000 + index}`,
      '2023-01-15',
      '2025-01-14',
      providers[index % providers.length],
      'Sample license for existing contractor',
      'Valid'
    ];
  });
  
  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.join(',') + '\n';
  });
  
  downloadCsv(csvContent, 'license_import_template.csv');
};

// Function to download sample CSV for insurance with actual contractor names
export const downloadSampleInsuranceCsv = async () => {
  // Get actual contractors from the database
  const { data: contractors, error } = await supabase
    .from('contractors')
    .select('name')
    .limit(3);
  
  if (error || !contractors || contractors.length === 0) {
    // Fallback if no contractors found
    const headers = ['contractor_name', 'insurance_type', 'provider', 'policy_number', 'coverage', 'issue_date', 'expiry_date', 'notes', 'status'];
    const sampleData = [
      ['No contractors found - Please add contractors first', 'General Liability', 'Insurance Co', 'POL-12345', '$2,000,000', '2023-01-15', '2024-01-14', 'Add contractors before importing insurance', 'Valid']
    ];
    
    let csvContent = headers.join(',') + '\n';
    sampleData.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    downloadCsv(csvContent, 'insurance_import_template.csv');
    return;
  }
  
  // Create sample data with actual contractor names
  const headers = ['contractor_name', 'insurance_type', 'provider', 'policy_number', 'coverage', 'issue_date', 'expiry_date', 'notes', 'status'];
  const insuranceTypes = ['General Liability', 'Workers Compensation', 'Professional Indemnity'];
  const providers = ['SafeCover Insurance', 'Protect Plus', 'Business Shield'];
  
  const sampleData = contractors.map((contractor, index) => {    
    return [
      contractor.name,
      insuranceTypes[index % insuranceTypes.length],
      providers[index % providers.length],
      `POL-${10000 + index}`,
      `$${(1 + index) * 1000000}`,
      '2023-01-15',
      '2024-01-14',
      'Sample insurance for existing contractor',
      'Valid'
    ];
  });
  
  let csvContent = headers.join(',') + '\n';
  sampleData.forEach(row => {
    csvContent += row.join(',') + '\n';
  });
  
  downloadCsv(csvContent, 'insurance_import_template.csv');
};

// Parse files (CSV, JSON)
export const parseFile = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      const fileContent = event.target.result as string;
      
      try {
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(fileContent);
          resolve(Array.isArray(jsonData) ? jsonData : [jsonData]);
        } else if (file.name.endsWith('.csv')) {
          // For CSV files, we'll use papaparse in the import functions directly
          resolve([]);
        } else {
          reject(new Error('Unsupported file format. Please use CSV or JSON'));
        }
      } catch (error) {
        reject(new Error(`Failed to parse file: ${error}`));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

const downloadCsv = (csvContent: string, fileName: string) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Use standard download approach for all browsers
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
