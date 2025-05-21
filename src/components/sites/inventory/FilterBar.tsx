
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Site } from '@/types/site';
import { toast } from 'sonner';

interface FilterBarProps {
  selectedSite: string;
  setSelectedSite: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  categoryFilter: string;
  setCategoryFilter: (value: string) => void;
  categories: string[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  selectedSite,
  setSelectedSite,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  categories
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('business_sites')
          .select('id, name, address')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          const formattedSites: Site[] = data.map((site) => ({
            id: site.id,
            name: site.name,
            address: site.address,
            complianceStatus: 'pending',
            assignedContractors: []
          }));
          setSites(formattedSites);
          
          // Select the first site by default if none is selected
          if (formattedSites.length > 0 && !selectedSite) {
            setSelectedSite(formattedSites[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching sites:', error);
        toast.error('Failed to load sites');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSites();
  }, []);
  
  const statuses = ['all', 'operational', 'maintenance', 'offline'];
  
  return (
    <div className="flex flex-col md:flex-row gap-3">
      <div className="flex-1">
        <Select 
          value={selectedSite} 
          onValueChange={setSelectedSite}
          disabled={loading}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={loading ? "Loading sites..." : "Select a site"} />
          </SelectTrigger>
          <SelectContent>
            {sites.map((site) => (
              <SelectItem key={site.id} value={site.id}>
                {site.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex-1 relative">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search equipment..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statuses.map((status) => (
            <SelectItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
        <SelectTrigger className="w-full md:w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterBar;
