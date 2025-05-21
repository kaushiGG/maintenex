
export interface Contractor {
  id: string;
  name: string;
  serviceType?: string;
  service_type: string;
  company?: string;
  phone?: string;
  credentials?: string;
  status: 'Active' | 'Warning' | 'Suspended' | string;
  contactEmail?: string;
  contactPhone?: string;
  contact_email: string;
  contact_phone: string;
  email?: string;
  location: string;
  rating?: number;
  completedJobs?: number;
  photo?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  auth_id?: string;
}
