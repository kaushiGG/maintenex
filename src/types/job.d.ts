
export interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  service_type: string;
  progress?: number;
  created_at: string;
  updated_at?: string;
  assigned_to?: string;
  site_id?: string;
  location_details?: string;
  start_date?: string;
  due_date?: string;
  contractor_id?: string;
  equipment_id?: string;  // Added missing property
  equipment?: string;     // Added missing property
  assignment_notes?: string; // Added missing property
  job_type?: string;      // Added missing property
}
