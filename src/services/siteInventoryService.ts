
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EquipmentItem, EquipmentStatus } from '@/components/sites/types/equipment';

export interface InventoryFilters {
  siteId?: string;
  searchQuery?: string;
  statusFilter?: string;
  categoryFilter?: string;
}

export const fetchSiteEquipment = async (filters: InventoryFilters): Promise<EquipmentItem[]> => {
  try {
    let query = supabase
      .from('equipment')
      .select('*')
      .order('name');
    
    // Apply filters
    if (filters.siteId) {
      query = query.eq('site_id', filters.siteId);
    }
    
    if (filters.searchQuery) {
      query = query.ilike('name', `%${filters.searchQuery}%`);
    }
    
    if (filters.statusFilter && filters.statusFilter !== 'all') {
      query = query.eq('status', filters.statusFilter);
    }
    
    if (filters.categoryFilter && filters.categoryFilter !== 'all') {
      query = query.eq('category', filters.categoryFilter);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    // Transform the data to match the EquipmentItem interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      location: item.location,
      status: item.status.toLowerCase() as EquipmentStatus,
      lastServiced: item.next_service_date ? new Date(item.next_service_date) : undefined,
      nextService: item.next_service_date ? new Date(item.next_service_date) : undefined,
      siteId: item.site_id,
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: item.serial_number
    }));
  } catch (error) {
    console.error('Error fetching site equipment:', error);
    toast.error('Failed to load inventory data');
    return [];
  }
};

export const fetchEquipmentCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('equipment')
      .select('category');
    
    if (error) {
      throw error;
    }
    
    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category))].filter(Boolean);
    return uniqueCategories;
  } catch (error) {
    console.error('Error fetching equipment categories:', error);
    toast.error('Failed to load equipment categories');
    return [];
  }
};
