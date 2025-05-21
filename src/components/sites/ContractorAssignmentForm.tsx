
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Site, ComplianceStatus } from '@/types/site';
import { Contractor } from '@/types/contractor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ContractorAssignmentFormProps {
  sites: Site[];
  contractors: Contractor[];
  selectedSite: Site | null;
  selectedContractor: string;
  onSiteChange: (siteId: string) => void;
  onContractorChange: (contractor: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

const ContractorAssignmentForm: React.FC<ContractorAssignmentFormProps> = ({
  sites,
  contractors,
  selectedSite,
  selectedContractor,
  onSiteChange,
  onContractorChange,
  onCancel,
  onSubmit,
  isLoading = false,
  isEditing = false
}) => {
  const [localSites, setLocalSites] = useState<Site[]>(sites);
  const [isSitesLoading, setIsSitesLoading] = useState(false);

  // Fetch sites from Supabase
  useEffect(() => {
    const fetchSites = async () => {
      setIsSitesLoading(true);
      try {
        const { data, error } = await supabase
          .from('business_sites')
          .select('*')
          .order('name', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          const mappedSites: Site[] = data.map(site => ({
            id: site.id,
            name: site.name,
            address: site.address,
            itemCount: site.item_count || 0,
            complianceStatus: (site.compliance_status || 'pending') as ComplianceStatus,
            assignedContractors: [], // This would need to be fetched separately
            coordinates: site.coordinates || undefined,
            site_type: site.site_type,
            contact_email: site.contact_email,
            contact_phone: site.contact_phone,
            notes: site.notes
          }));
          
          setLocalSites(mappedSites);
        }
      } catch (error: any) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      } finally {
        setIsSitesLoading(false);
      }
    };

    fetchSites();
  }, []);

  const sitesToDisplay = localSites.length > 0 ? localSites : sites;

  return (
    <>
      <DialogHeader>
        <DialogTitle>
          {isEditing ? 'Update Contractor Assignment' : 'Assign Contractor to Site'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="space-y-4 py-2">
        <div className="space-y-2">
          <label htmlFor="site-select" className="text-sm font-medium">
            Site Location
          </label>
          <Select
            value={selectedSite?.id || ''}
            onValueChange={onSiteChange}
            disabled={isLoading || isSitesLoading || isEditing}
          >
            <SelectTrigger>
              <SelectValue placeholder={isSitesLoading ? "Loading sites..." : "Select a site"} />
            </SelectTrigger>
            <SelectContent>
              {isSitesLoading ? (
                <SelectItem value="loading" disabled>Loading sites...</SelectItem>
              ) : sitesToDisplay.length === 0 ? (
                <SelectItem value="none" disabled>No sites available</SelectItem>
              ) : (
                sitesToDisplay.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="contractor-select" className="text-sm font-medium">
            Contractor
          </label>
          <Select
            value={selectedContractor}
            onValueChange={onContractorChange}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder={isLoading ? "Loading contractors..." : "Select a contractor"} />
            </SelectTrigger>
            <SelectContent>
              {isLoading ? (
                <SelectItem value="loading" disabled>Loading contractors...</SelectItem>
              ) : contractors.length === 0 ? (
                <SelectItem value="none" disabled>No contractors available</SelectItem>
              ) : (
                contractors.map(contractor => (
                  <SelectItem key={contractor.id} value={contractor.name}>
                    {contractor.name} - {contractor.serviceType}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading || isSitesLoading}
        >
          Cancel
        </Button>
        <Button 
          className="bg-[#7851CA] hover:bg-[#6a46b5]"
          onClick={onSubmit}
          disabled={isLoading || isSitesLoading || !selectedSite || !selectedContractor}
        >
          {isLoading || isSitesLoading ? 'Loading...' : isEditing ? 'Update Assignment' : 'Assign Contractor'}
        </Button>
      </DialogFooter>
    </>
  );
};

export default ContractorAssignmentForm;
