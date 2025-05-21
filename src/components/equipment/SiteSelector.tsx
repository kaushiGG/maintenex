
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Site {
  id: string;
  name: string;
}

interface SiteSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

const SiteSelector: React.FC<SiteSelectorProps> = ({ value, onChange }) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('business_sites')
          .select('id, name')
          .order('name');
          
        if (error) {
          throw error;
        }
        
        if (data) {
          setSites(data);
          // Select the first site by default if none is selected
          if (data.length > 0 && !value) {
            onChange(data[0].id);
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
  }, [value, onChange]);

  return (
    <Select 
      value={value} 
      onValueChange={onChange}
      disabled={loading}
    >
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder={loading ? "Loading sites..." : "Select a site"} />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site.id} value={site.id}>
            {site.name}
          </SelectItem>
        ))}
        {loading && (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
            <span>Loading sites...</span>
          </div>
        )}
        {!loading && sites.length === 0 && (
          <div className="px-2 py-2 text-sm text-gray-500">
            No sites found. Please add a site first.
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export default SiteSelector;
