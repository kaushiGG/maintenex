
export type ComplianceStatus = 'compliant' | 'warning' | 'non-compliant' | 'pending';

export interface ComplianceReport {
  id: string;
  siteId: string;
  score: number;
  status: ComplianceStatus;
  auditDate: Date;
  notes?: string;
  createdBy?: string;
}
