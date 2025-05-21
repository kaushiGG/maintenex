
import { Contractor } from '@/types/contractor';

export const filterContractors = (
  contractors: Contractor[],
  searchTerm: string,
  filterStatus: string
): Contractor[] => {
  console.log('Filtering contractors:', { contractors, searchTerm, filterStatus });
  
  if (!contractors || contractors.length === 0) {
    return [];
  }
  
  return contractors.filter((contractor) => {
    // Search term filter
    const matchesSearch =
      !searchTerm ||
      contractor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (contractor.serviceType && contractor.serviceType.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contractor.contactEmail && contractor.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (contractor.location && contractor.location.toLowerCase().includes(searchTerm.toLowerCase()));

    // Status filter
    const matchesStatus = filterStatus === 'all' || !filterStatus || contractor.status === filterStatus;

    return matchesSearch && matchesStatus;
  });
};
