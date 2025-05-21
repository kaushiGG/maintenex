
import { supabase } from "@/integrations/supabase/client";

export interface ServiceArea {
  id: string;
  name: string;
  radius: number;
  coordinates: string;
  status: string;
  postcodes: string;
  contractor_id?: string;
  created_at?: string;
}

export async function fetchServiceAreas() {
  const { data, error } = await supabase
    .from('service_areas')
    .select('*');

  if (error) {
    console.error('Error fetching service areas:', error);
    throw error;
  }

  return data as ServiceArea[];
}

export async function createServiceArea(serviceArea: Omit<ServiceArea, 'id' | 'created_at' | 'contractor_id'>) {
  const { data, error } = await supabase
    .from('service_areas')
    .insert([serviceArea])
    .select();

  if (error) {
    console.error('Error creating service area:', error);
    throw error;
  }

  return data?.[0] as ServiceArea;
}

export async function updateServiceArea(id: string, updates: Partial<Omit<ServiceArea, 'id' | 'created_at' | 'contractor_id'>>) {
  const { data, error } = await supabase
    .from('service_areas')
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating service area:', error);
    throw error;
  }

  return data?.[0] as ServiceArea;
}

export async function deleteServiceArea(id: string) {
  const { error } = await supabase
    .from('service_areas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service area:', error);
    throw error;
  }

  return true;
}
