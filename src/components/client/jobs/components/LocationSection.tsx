import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { Equipment } from '@/types/equipment';

interface LocationSectionProps {
  jobData: {
    site: string;
    building: string;
    locationDetails: string;
    equipment: string;
  };
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: string, value: string) => void;
  onEquipmentLoad?: (equipmentList: Equipment[]) => void;
}

interface Site {
  id: string;
  name: string;
}

const LocationSection: React.FC<LocationSectionProps> = ({
  jobData,
  handleInputChange,
  handleSelectChange,
  onEquipmentLoad
}) => {
  const [sites, setSites] = useState<Site[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEquipment, setLoadingEquipment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (jobData.site) {
      fetchEquipment(jobData.site);
    } else {
      setEquipment([]);
    }
  }, [jobData.site]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching all sites from business_sites table');
      
      const { data, error } = await supabase
        .from('business_sites')
        .select('id, name')
        .order('name');
        
      if (error) {
        console.error('Error fetching sites:', error);
        setError(`Failed to load sites: ${error.message}`);
        toast.error('Failed to load sites');
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Sites fetched successfully:', data.length, 'sites found');
        setSites(data);
        
        if (!jobData.site) {
          console.log('Auto-selecting first site:', data[0].name, 'with id:', data[0].id);
          handleSelectChange('site', data[0].id);
        }
      } else {
        console.log('No sites found in the database');
        setSites([]);
        setError('No sites found. Please add sites to the database first.');
      }
    } catch (error: any) {
      console.error('Failed to fetch sites:', error);
      setError(`Error loading sites: ${error.message || 'Unknown error'}`);
      toast.error('Failed to load sites. Please refresh and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEquipment = async (siteId: string) => {
    try {
      setLoadingEquipment(true);
      console.log('Fetching equipment for site:', siteId);
      
      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, model, serial_number, site_id')
        .eq('site_id', siteId)
        .order('name');
        
      if (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Failed to load equipment');
        return;
      }
      
      if (data && data.length > 0) {
        console.log('Equipment fetched successfully:', data.length, 'items found');
        setEquipment(data);
        
        if (onEquipmentLoad) {
          onEquipmentLoad(data);
        }
      } else {
        console.log('No equipment found for this site');
        setEquipment([]);
        
        if (onEquipmentLoad) {
          onEquipmentLoad([]);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch equipment:', error);
      toast.error('Failed to load equipment. Please try again.');
    } finally {
      setLoadingEquipment(false);
    }
  };

  const getSiteName = (siteId: string): string => {
    const site = sites.find(s => s.id === siteId);
    return site ? site.name : "Unknown Site";
  };

  const getEquipmentName = (equipmentId: string): string => {
    const item = equipment.find(e => e.id === equipmentId);
    return item ? `${item.name} (${item.model})` : "Select equipment";
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-gray-200">Location</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="form-group">
          <Label htmlFor="site">Site</Label>
          {error ? (
            <div className="mt-1 text-red-500 text-sm">{error}</div>
          ) : (
            <Select 
              value={jobData.site || ''}
              onValueChange={(value) => handleSelectChange('site', value)}
              disabled={loading}
            >
              <SelectTrigger id="site" className="w-full">
                <SelectValue placeholder={loading ? "Loading sites..." : "Select site"}>
                  {jobData.site && !loading ? getSiteName(jobData.site) : (loading ? "Loading..." : "Select site")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {loading ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                    <span>Loading sites...</span>
                  </div>
                ) : sites.length > 0 ? (
                  sites.map((site) => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-gray-500">
                    No sites found. Please add a site first.
                  </div>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
        
        <div className="form-group">
          <Label htmlFor="equipment">Equipment</Label>
          <Select
            value={jobData.equipment || ''}
            onValueChange={(value) => handleSelectChange('equipment', value)}
            disabled={loadingEquipment || !jobData.site}
          >
            <SelectTrigger id="equipment" className="w-full">
              <SelectValue placeholder={loadingEquipment ? "Loading equipment..." : "Select equipment"}>
                {jobData.equipment && !loadingEquipment ? getEquipmentName(jobData.equipment) : 
                 (loadingEquipment ? "Loading..." : "Select equipment")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {loadingEquipment ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500 mr-2" />
                  <span>Loading equipment...</span>
                </div>
              ) : equipment.length > 0 ? (
                equipment.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name} ({item.model})
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-gray-500">
                  No equipment found for this site.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="form-group">
          <Label htmlFor="building">Building/Area</Label>
          <Select
            value={jobData.building || ''}
            onValueChange={(value) => handleSelectChange('building', value)}
          >
            <SelectTrigger id="building" className="w-full">
              <SelectValue placeholder="Select building/area" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="main">Main Building</SelectItem>
              <SelectItem value="annex">Annex</SelectItem>
              <SelectItem value="floor1">1st Floor</SelectItem>
              <SelectItem value="floor2">2nd Floor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="form-group">
          <Label htmlFor="locationDetails">Location Details</Label>
          <Input 
            id="locationDetails" 
            name="locationDetails"
            placeholder="Room number, area description, etc." 
            className="mt-1"
            value={jobData.locationDetails}
            onChange={handleInputChange}
          />
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
