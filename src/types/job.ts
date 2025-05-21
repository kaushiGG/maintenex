
export interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  description?: string;
  service_type: string;
  site_id?: string;
  contractor_id?: string;
  business_sites?: {
    name: string;
    address: string;
  };
  created_at: string;
  
  // Time tracking fields
  start_time?: string;  // Timestamp when job is started
  completion_time?: string;  // Timestamp when job is completed
  time_spent?: number;  // Duration in seconds
  
  // Additional fields to resolve TypeScript errors
  assigned_to?: string;
  progress?: number;
  location_details?: string;
  updated_at?: string;
  start_date?: string; // For backward compatibility - should use start_time going forward
  
  // Adding missing properties that caused errors
  equipment_id?: string;
  equipment?: string;
  assignment_notes?: string;
  job_type?: string;
}

// Job status types
export type JobStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';

// Job priority types
export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

// Service types
export type ServiceType = 
  | 'test-tag' 
  | 'rcd-testing' 
  | 'emergency-lighting' 
  | 'thermal-imaging'
  | 'plumbing'
  | 'air-conditioning'; 
