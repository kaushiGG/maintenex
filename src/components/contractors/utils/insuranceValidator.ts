
/**
 * Validate insurance data
 * @returns Object with validation result and errors
 */
export const validateInsuranceData = (insurance: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Validate required fields
  if (!insurance.contractor_name) errors.push(`Missing contractor name for insurance ${insurance.policy_number || 'unknown'}`);
  if (!insurance.insurance_type) errors.push(`Missing insurance type for contractor ${insurance.contractor_name || 'unknown'}`);
  if (!insurance.provider) errors.push(`Missing provider for contractor ${insurance.contractor_name || 'unknown'}`);
  if (!insurance.policy_number) errors.push(`Missing policy number for contractor ${insurance.contractor_name || 'unknown'}`);
  if (!insurance.coverage) errors.push(`Missing coverage for insurance ${insurance.policy_number || 'unknown'}`);
  if (!insurance.issue_date) errors.push(`Missing issue date for insurance ${insurance.policy_number || 'unknown'}`);
  if (!insurance.expiry_date) errors.push(`Missing expiry date for insurance ${insurance.policy_number || 'unknown'}`);
  
  // Validate date formats
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (insurance.issue_date && !dateRegex.test(insurance.issue_date)) {
    errors.push(`Invalid issue_date format for ${insurance.contractor_name || 'unknown'}. Use YYYY-MM-DD format`);
  }
  
  if (insurance.expiry_date && !dateRegex.test(insurance.expiry_date)) {
    errors.push(`Invalid expiry_date format for ${insurance.contractor_name || 'unknown'}. Use YYYY-MM-DD format`);
  }
  
  if (insurance.status && !['Valid', 'Expiring', 'Expired'].includes(insurance.status)) {
    errors.push(`Invalid status for insurance ${insurance.policy_number || 'unknown'}. Must be one of: Valid, Expiring, Expired`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
