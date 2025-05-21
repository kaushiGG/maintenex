
import { useState, useCallback } from 'react';
import { Site } from '@/types/site';
import { Contractor } from '@/types/contractor';
import { 
  assignContractor, 
  deleteContractorAssignment,
  fetchSiteContractors
} from '@/services/contractorAssignmentService';
import { toast } from 'sonner';

export const useContractorAssignments = (sites: Site[], setSites: (sites: Site[]) => void) => {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [selectedContractor, setSelectedContractor] = useState('');
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siteContractorMapping, setSiteContractorMapping] = useState<Record<string, Record<string, string>>>({});

  // Refresh site contractor assignments from the database
  const refreshAssignments = useCallback(async () => {
    try {
      const { updatedSites, mapping } = await fetchSiteContractors(sites);
      setSites(updatedSites);
      setSiteContractorMapping(mapping);
      return { updatedSites, mapping };
    } catch (error) {
      console.error('Failed to refresh site contractor assignments:', error);
      return { updatedSites: sites, mapping: siteContractorMapping };
    }
  }, [sites, setSites, siteContractorMapping]);

  const handleOpenAssignDialog = useCallback((site: Site | null, contractorName: string = '') => {
    setSelectedSite(site);
    setSelectedContractor(contractorName);
    setIsEditing(!!contractorName);
    
    if (site && contractorName) {
      // Get the assignment ID for this site-contractor pair
      const assignmentId = siteContractorMapping[site.id]?.[contractorName] || null;
      setCurrentAssignmentId(assignmentId);
    } else {
      setCurrentAssignmentId(null);
    }
    
    setAssignDialogOpen(true);
  }, [siteContractorMapping]);

  const handleSiteChange = useCallback((siteId: string) => {
    const site = sites.find(s => s.id === siteId) || null;
    setSelectedSite(site);
  }, [sites]);

  const handleContractorChange = useCallback((contractor: string) => {
    setSelectedContractor(contractor);
  }, []);

  const handleAssignContractor = useCallback(async () => {
    if (!selectedSite || !selectedContractor) {
      toast.error('Please select both a site and a contractor');
      return;
    }

    // Check if contractor is already assigned to the site (if not editing)
    if (!isEditing && selectedSite.assignedContractors?.includes(selectedContractor)) {
      toast.warning(`${selectedContractor} is already assigned to ${selectedSite.name}`);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get all contractors from the contract service
      const contractors = await import('@/services/contractorAssignmentService').then(
        module => module.fetchContractors()
      );
      
      const success = await assignContractor(
        selectedSite, 
        selectedContractor, 
        contractors, 
        isEditing, 
        currentAssignmentId
      );
      
      if (success) {
        // Refresh the sites list with updated assignments
        await refreshAssignments();
        setAssignDialogOpen(false);
      }
    } catch (error) {
      console.error('Error in assignment:', error);
      toast.error('Failed to assign contractor: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  }, [selectedSite, selectedContractor, isEditing, currentAssignmentId, refreshAssignments]);

  const handleDeleteContractor = useCallback(async (site: Site, contractorName: string) => {
    try {
      // Get assignment ID from the mapping
      const assignmentId = siteContractorMapping[site.id]?.[contractorName];
      
      if (!assignmentId) {
        toast.error('Assignment record not found');
        return;
      }
      
      setIsSubmitting(true);
      
      const success = await deleteContractorAssignment(assignmentId, site, contractorName);
      
      if (success) {
        // Refresh assignments from database
        await refreshAssignments();
      }
    } catch (error) {
      console.error('Error deleting assignment:', error);
      toast.error('Failed to remove contractor assignment: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  }, [siteContractorMapping, refreshAssignments]);

  return {
    assignDialogOpen,
    selectedSite,
    selectedContractor,
    isEditing,
    isSubmitting,
    setAssignDialogOpen,
    handleOpenAssignDialog,
    handleSiteChange,
    handleContractorChange,
    handleAssignContractor,
    handleDeleteContractor
  };
};

export default useContractorAssignments;
