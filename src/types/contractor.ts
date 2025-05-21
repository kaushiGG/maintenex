
export interface Contractor {
  id: string;
  name: string;
  service_type: string;
  status: string;
  contact_email: string;
  contact_phone: string;
  location: string;
  
  // Optional fields
  serviceType?: string;
  company?: string;
  phone?: string;
  credentials?: string;
  contactEmail?: string;
  contactPhone?: string;
  email?: string;
  rating?: number;
  completedJobs?: number;
  photo?: string;
  notes?: string;
  lastUpdated?: Date;
  auth_id?: string;
  owner_id?: string;
  created_at?: string;
  updated_at?: string;
  job_title?: string;
}
