
/**
 * Validate contractor data
 * @returns Object with validation result and errors
 */
export const validateContractorData = (contractor: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!contractor.name) errors.push(`Missing name for contractor ${contractor.name || 'unknown'}`);
  if (!contractor.service_type && !contractor.serviceType) errors.push(`Missing service type for contractor ${contractor.name || 'unknown'}`);
  
  if (contractor.status && !['active', 'warning', 'suspended'].includes(contractor.status.toLowerCase())) {
    errors.push(`Invalid status for contractor ${contractor.name || 'unknown'}. Must be one of: Active, Warning, Suspended`);
  }
  
  if (contractor.contact_email && !/\S+@\S+\.\S+/.test(contractor.contact_email)) {
    errors.push(`Invalid contact_email for contractor ${contractor.name || 'unknown'}`);
  }
  
  if (contractor.rating && (isNaN(Number(contractor.rating)) || Number(contractor.rating) < 1 || Number(contractor.rating) > 5)) {
    errors.push(`Invalid rating for contractor ${contractor.name || 'unknown'}. Must be a number between 1 and 5`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
