
export interface TestTagReportDataType {
  id: string;
  jobId: string;
  siteId: string;
  testDate: string;
  totalItems: number;
  passedItems: number;
  failedItems: number;
  nextTestDue: string;
  tester: string;
  items: TestTagItem[];
  notes?: string;
}

export interface TestTagItem {
  id: string;
  name: string;
  location: string;
  serialNumber: string;
  testType: string;
  status: 'passed' | 'failed';
  result: string;
  notes?: string;
}
