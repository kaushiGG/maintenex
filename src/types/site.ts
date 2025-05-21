export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant' | 'pending';

export interface SiteEquipment {
  id: string;
  name: string;
  category: string;
  status: string;
  lastService?: string;
}

export interface Site {
  id: string;
  name: string;
  address: string;
  
  // Required fields from database
  site_type: string;
  contact_email: string;
  contact_phone: string;
  
  // Fields that may need conversion when fetching from the database
  compliance_status?: string;
  complianceStatus?: ComplianceStatus;
  item_count?: number;
  itemCount?: number;
  assigned_contractors?: string[];
  assignedContractors?: string[];
  equipment?: SiteEquipment[];
  
  // Optional fields
  coordinates?: string;
  contact_name?: string;
  notes?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Interface for geocoded sites with lat/lng coordinates
export interface GeocodedSite extends Site {
  geocoded: { lat: number; lng: number } | [number, number];
}
