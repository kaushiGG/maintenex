
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant' | 'pending';

export interface ComplianceItem {
  id: string;
  name: string;
  status: ComplianceStatus;
  dueDate?: string;
  category: string;
}

export interface ComplianceReport {
  id: string;
  siteId: string;
  score: number;
  status: string;
  auditDate: string;
  notes?: string;
}
