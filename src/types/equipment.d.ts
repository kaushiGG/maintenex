export interface Equipment {
  id: string;
  name: string;
  model?: string;
  serial_number?: string;
  site_id: string;
  description?: string;
  installation_date?: string;
  last_service_date?: string;
  service_interval_days?: number;
  next_service_date?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
} 