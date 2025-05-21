import { supabase } from '@/integrations/supabase/client';
import { Site } from '@/types/site';
import { Contractor } from '@/types/contractor';
import { toast } from 'sonner';

/**
 * Fetches all sites from the database
 */
export const fetchSites = async (): Promise<Site[]> => {
  try {
    const { data, error } = await supabase
      .from('business_sites')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) throw error;
    
    // Map database records to Site objects
    const sites: Site[] = data.map(site => ({
      id: site.id,
      name: site.name,
      address: site.address,
      complianceStatus: site.compliance_status as any || 'pending',
      assignedContractors: [], // Will be populated by fetchSiteContractors
      itemCount: site.item_count || 0,
      coordinates: site.coordinates || undefined,
      site_type: site.site_type,
      contact_email: site.contact_email,
      contact_phone: site.contact_phone,
      notes: site.notes
    }));
    
    return sites;
  } catch (error) {
    console.error('Error fetching sites:', error);
    toast.error('Failed to load sites');
    return [];
  }
};

/**
 * Fetches all contractors from the database
 */
export const fetchContractors = async (): Promise<Contractor[]> => {
  try {
    const { data, error } = await supabase
      .from('contractors')
      .select('*');

    if (error) {
      throw error;
    }

    const contractors: Contractor[] = data.map(contractor => ({
      id: contractor.id,
      name: contractor.name,
      service_type: contractor.service_type || 'General',
      status: contractor.status || 'Active',
      contact_email: contractor.contact_email || '',
      contact_phone: contractor.contact_phone || '',
      location: contractor.location || 'Not specified',
      // Optional fields
      credentials: contractor.credentials,
      rating: contractor.rating,
      notes: contractor.notes,
      serviceType: contractor.service_type,
      contactEmail: contractor.contact_email,
      contactPhone: contractor.contact_phone
    }));

    return contractors;
  } catch (error) {
    console.error('Error fetching contractors:', error);
    toast.error('Failed to load contractors');
    return [];
  }
};

/**
 * Fetches the contractor assignments for a list of sites
 */
export const fetchSiteContractors = async (sites: Site[]): Promise<{
  updatedSites: Site[],
  mapping: Record<string, Record<string, string>>
}> => {
  try {
    // Create a map of site IDs to index in the sites array for quick lookup
    const siteMap: Record<string, number> = {};
    sites.forEach((site, index) => {
      siteMap[site.id] = index;
    });
    
    // Create deep copy of sites array to avoid mutation issues
    const updatedSites = [...sites.map(site => ({
      ...site,
      assignedContractors: [] // Reset assigned contractors
    }))];
    
    // Map to store site_id -> contractor_name -> assignment_id
    const mapping: Record<string, Record<string, string>> = {};
    
    // 1. Fetch all site-contractor relationships from the site_contractors table
    const { data: siteContractorsData, error: siteContractorsError } = await supabase
      .from('site_contractors')
      .select('*');
    
    if (siteContractorsError) throw siteContractorsError;
    
    // 2. ALSO fetch contractors from jobs table (your SQL query approach)
    const { data: jobsWithContractors, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        site_id,
        contractor_id
      `)
      .not('contractor_id', 'is', null);
    
    if (jobsError) throw jobsError;
    
    // Combine all contractor IDs from both sources
    const contractorIdsFromSites = siteContractorsData?.map(sc => sc.contractor_id) || [];
    const contractorIdsFromJobs = jobsWithContractors?.map(job => job.contractor_id) || [];
    const allContractorIds = [...new Set([...contractorIdsFromSites, ...contractorIdsFromJobs])];
    
    // If we have no contractors from either source, return early
    if (allContractorIds.length === 0) {
      return { updatedSites, mapping };
    }
    
    // Fetch contractors by IDs
    const { data: contractorsData, error: contractorsError } = await supabase
      .from('contractors')
      .select('*')
      .in('id', allContractorIds);
    
    if (contractorsError) throw contractorsError;
    
    // Create a map of contractor IDs to names
    const contractorMap: Record<string, string> = {};
    if (contractorsData) {
      contractorsData.forEach(contractor => {
        contractorMap[contractor.id] = contractor.name;
      });
    }
    
    // Process direct site-contractor relationships
    if (siteContractorsData) {
      siteContractorsData.forEach(assignment => {
        const siteId = assignment.site_id;
        const contractorId = assignment.contractor_id;
        const contractorName = contractorMap[contractorId];
        const assignmentId = assignment.id;
        
        if (siteId && contractorName) {
          // Update mapping
          if (!mapping[siteId]) {
            mapping[siteId] = {};
          }
          mapping[siteId][contractorName] = assignmentId;
          
          // Update site's assigned contractors if not already added
          const siteIndex = siteMap[siteId];
          if (siteIndex !== undefined && 
              !updatedSites[siteIndex].assignedContractors.includes(contractorName)) {
            updatedSites[siteIndex].assignedContractors.push(contractorName);
          }
        }
      });
    }
    
    // Process job-based contractor assignments
    if (jobsWithContractors) {
      jobsWithContractors.forEach(job => {
        const siteId = job.site_id;
        const contractorId = job.contractor_id;
        const contractorName = contractorMap[contractorId];
        const assignmentId = job.id; // Using job ID as assignment ID for job-based assignments
        
        if (siteId && contractorName) {
          // Update mapping if not already set
          if (!mapping[siteId]) {
            mapping[siteId] = {};
          }
          if (!mapping[siteId][contractorName]) {
            mapping[siteId][contractorName] = assignmentId;
          }
          
          // Update site's assigned contractors if not already added
          const siteIndex = siteMap[siteId];
          if (siteIndex !== undefined && 
              !updatedSites[siteIndex].assignedContractors.includes(contractorName)) {
            updatedSites[siteIndex].assignedContractors.push(contractorName);
          }
        }
      });
    }
    
    console.log('Updated sites with contractors (from both sources):', updatedSites);
    return { updatedSites, mapping };
  } catch (error) {
    console.error('Error fetching site contractors:', error);
    toast.error('Failed to load contractor assignments');
    return { updatedSites: sites, mapping: {} };
  }
};

export const assignContractor = async (
  selectedSite: Site,
  contractorName: string,
  contractors: Contractor[],
  isEditing: boolean,
  assignmentId: string | null
): Promise<boolean> => {
  try {
    // Find contractor id by name
    const contractor = contractors.find(c => c.name === contractorName);
    
    if (!contractor) {
      throw new Error('Contractor not found');
    }

    // Verify that contractor exists in the database
    const { data: contractorExists, error: contractorCheckError } = await supabase
      .from('contractors')
      .select('id')
      .eq('id', contractor.id)
      .maybeSingle();

    if (contractorCheckError || !contractorExists) {
      console.error('Contractor does not exist in database:', contractor.id);
      throw new Error('Contractor does not exist in database');
    }

    // Check if a relationship already exists between this site and contractor
    const { data: existingAssignment, error: checkError } = await supabase
      .from('site_contractors')
      .select('*')
      .eq('site_id', selectedSite.id)
      .eq('contractor_id', contractor.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing assignment:', checkError);
      throw checkError;
    }

    if (existingAssignment && !isEditing) {
      console.log('Assignment already exists:', existingAssignment);
      toast.warning(`${contractorName} is already assigned to ${selectedSite.name}`);
      return true;
    }

    // Insert record in site_contractors table
    const { data, error } = await supabase
      .from('site_contractors')
      .insert({
        site_id: selectedSite.id,
        contractor_id: contractor.id
      })
      .select();

    if (error) {
      console.error('Insert error:', error);
      throw error;
    }
    
    console.log('Inserted site contractor:', data);
    toast.success(`${contractorName} has been assigned to ${selectedSite.name}`);

    return true;
  } catch (error: any) {
    console.error('Error assigning contractor:', error);
    toast.error('Failed to assign contractor to site: ' + (error.message || error));
    return false;
  }
};

/**
 * Deletes a contractor assignment from a site
 */
export const deleteContractorAssignment = async (
  assignmentId: string,
  site: Site,
  contractorName: string
): Promise<boolean> => {
  try {
    // Delete the assignment record
    const { error } = await supabase
      .from('site_contractors')
      .delete()
      .eq('id', assignmentId);
    
    if (error) throw error;
    
    toast.success(`${contractorName} has been removed from ${site.name}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting assignment:', error);
    toast.error('Failed to remove contractor assignment: ' + (error.message || error));
    return false;
  }
};
