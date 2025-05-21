
export interface LicenseType {
  id: string;
  value: string;
  label: string;
  icon_name: string;
  created_at?: string;
}

export interface ContractorLicense {
  id: string;
  contractor_id: string;
  license_type: string;
  license_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'Valid' | 'Expired' | 'Pending';
  verified?: boolean;
  verified_at?: string;
  verified_by?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}
