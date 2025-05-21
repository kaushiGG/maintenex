export interface ThermalReportData {
  id: string;
  job_id: string;
  site_id: string;
  thermal_image_url: string;
  standard_image_url: string;
  analysis_date: string;
  min_temp: number;
  max_temp: number;
  avg_temp: number;
  findings: string;
  recommendations: string;
  status: string;
}

export interface TestTagReportData {
  id: string;
  job_id: string;
  site_id: string;
  inspection_date: string;
  total_items: number;
  passed_items: number;
  failed_items: number;
  status: string;
  next_test_due: string;
  items: any[];
}

export interface RcdTestingReportData {
  id: string;
  job_id: string;
  site_id: string;
  test_date: string;
  total_rcds: number;
  passed_rcds: number;
  failed_rcds: number;
  status: string;
  next_test_due: string;
  rcd_details: any[];
}

export interface EmergencyLightingReportData {
  id: string;
  job_id: string;
  site_id: string;
  test_date: string;
  total_lights: number;
  passed_lights: number;
  failed_lights: number;
  status: string;
  next_test_due: string;
  lighting_details: any[];
}

export type ReportData = ThermalReportData | TestTagReportData | RcdTestingReportData | EmergencyLightingReportData; 