
/**
 * Validate license data
 * @returns Object with validation result and errors
 */
export const validateLicenseData = (license: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate required fields
  if (!license.contractor_name) errors.push(`Missing contractor name for license ${license.license_number || 'unknown'}`);
  if (!license.license_type) errors.push(`Missing license type for contractor ${license.contractor_name || 'unknown'}`);
  if (!license.license_number) errors.push(`Missing license number for contractor ${license.contractor_name || 'unknown'}`);
  if (!license.issue_date) errors.push(`Missing issue date for license ${license.license_number || 'unknown'}`);
  if (!license.expiry_date) errors.push(`Missing expiry date for license ${license.license_number || 'unknown'}`);
  if (!license.provider) errors.push(`Missing provider for license ${license.license_number || 'unknown'}`);
  
  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (license.issue_date && !dateRegex.test(license.issue_date)) {
    errors.push(`Invalid issue_date format for ${license.contractor_name || 'unknown'}. Use YYYY-MM-DD format`);
  }
  
  if (license.expiry_date && !dateRegex.test(license.expiry_date)) {
    errors.push(`Invalid expiry_date format for ${license.contractor_name || 'unknown'}. Use YYYY-MM-DD format`);
  }
  
  if (license.status && !['Valid', 'Expired', 'Suspended', 'Pending'].includes(license.status)) {
    errors.push(`Invalid status for license ${license.license_number || 'unknown'}. Must be one of: Valid, Expired, Suspended, Pending`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
