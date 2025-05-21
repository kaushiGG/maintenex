import { faker } from '@faker-js/faker';

export interface ACUnit {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  location: string;
  installationDate: string;
  lastService: string;
  nextService: string;
  filterLastReplaced: string;
  filterDueDate: string;
  type: 'Split System' | 'Ducted' | 'Cassette' | 'Window' | 'Portable';
  status: 'Operational' | 'Needs Service' | 'Filter Due' | 'Under Repair';
  notes?: string;
  manufacturer: string;
  refrigerantType: string;
  capacity: string;
  photos: string[];
}

export interface ServiceReport {
  id: string;
  unitId: string;
  date: string;
  technicianName: string;
  workPerformed: string[];
  filterReplaced: boolean;
  issues: string;
  recommendations: string;
  photos: string[];
}

// Generate random service dates
const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate random AC units
export const generateACUnits = (count: number): ACUnit[] => {
  const units: ACUnit[] = [];
  const types: ACUnit['type'][] = ['Split System', 'Ducted', 'Cassette', 'Window', 'Portable'];
  const status: ACUnit['status'][] = ['Operational', 'Needs Service', 'Filter Due', 'Under Repair'];
  const manufacturers = ['Daikin', 'Mitsubishi', 'Fujitsu', 'LG', 'Samsung', 'Panasonic', 'Hitachi'];
  const refrigerants = ['R32', 'R410A', 'R22', 'R290'];
  const capacities = ['2.5kW', '3.5kW', '5kW', '7kW', '10kW', '12kW'];
  
  for (let i = 1; i <= count; i++) {
    const installDate = generateRandomDate(new Date(2018, 0, 1), new Date(2023, 11, 31));
    const lastServiceDate = generateRandomDate(new Date(2023, 0, 1), new Date());
    const nextServiceDate = generateRandomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000));
    const filterLastReplacedDate = generateRandomDate(new Date(2023, 0, 1), new Date());
    const filterDueDate = generateRandomDate(new Date(), new Date(Date.now() + 180 * 24 * 60 * 60 * 1000));
    
    const unit: ACUnit = {
      id: `AC-${i.toString().padStart(3, '0')}`,
      name: `AC Unit ${i}`,
      model: faker.string.alphanumeric(8).toUpperCase(),
      serialNumber: faker.string.alphanumeric(12).toUpperCase(),
      location: faker.location.secondaryAddress(),
      installationDate: installDate,
      lastService: lastServiceDate,
      nextService: nextServiceDate,
      filterLastReplaced: filterLastReplacedDate,
      filterDueDate: filterDueDate,
      type: types[Math.floor(Math.random() * types.length)],
      status: status[Math.floor(Math.random() * status.length)],
      notes: Math.random() > 0.3 ? faker.lorem.sentence() : undefined,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      refrigerantType: refrigerants[Math.floor(Math.random() * refrigerants.length)],
      capacity: capacities[Math.floor(Math.random() * capacities.length)],
      photos: []
    };
    
    units.push(unit);
  }
  
  return units;
};

// Generate mock service reports
export const generateServiceReports = (units: ACUnit[], count: number): ServiceReport[] => {
  const reports: ServiceReport[] = [];
  const workOptions = [
    'General inspection',
    'Filter cleaning',
    'Filter replacement',
    'Coil cleaning',
    'Refrigerant check',
    'Drainage check',
    'Electrical inspection',
    'Thermostat calibration',
    'Fan motor lubrication',
    'Noise assessment',
    'Ductwork inspection',
    'Remote control check'
  ];
  
  for (let i = 1; i <= count; i++) {
    const unitIndex = Math.floor(Math.random() * units.length);
    const unit = units[unitIndex];
    const reportDate = generateRandomDate(new Date(2022, 0, 1), new Date());
    
    // Generate random work performed (3-6 items)
    const workItemCount = Math.floor(Math.random() * 4) + 3;
    const workItems: string[] = [];
    for (let j = 0; j < workItemCount; j++) {
      const workItem = workOptions[Math.floor(Math.random() * workOptions.length)];
      if (!workItems.includes(workItem)) {
        workItems.push(workItem);
      }
    }
    
    const filterReplaced = workItems.includes('Filter replacement');
    
    const report: ServiceReport = {
      id: `SR-${i.toString().padStart(3, '0')}`,
      unitId: unit.id,
      date: reportDate,
      technicianName: faker.person.fullName(),
      workPerformed: workItems,
      filterReplaced,
      issues: Math.random() > 0.7 ? faker.lorem.sentence() : '',
      recommendations: Math.random() > 0.5 ? faker.lorem.paragraph() : '',
      photos: []
    };
    
    reports.push(report);
  }
  
  return reports;
};

// Generate the mock data
export const acUnits = generateACUnits(15);
export const serviceReports = generateServiceReports(acUnits, 30);

// Get service reports for a specific AC unit
export const getServiceReportsForUnit = (unitId: string): ServiceReport[] => {
  return serviceReports.filter(report => report.unitId === unitId);
};

// Add compliance rate information
export interface ComplianceData {
  overallRate: number;
  serviceComplianceRate: number;
  filterReplacementRate: number;
  documentationRate: number;
  lastAuditDate: string;
  nextAuditDue: string;
  issues: {
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export const complianceData: ComplianceData = {
  overallRate: 84,
  serviceComplianceRate: 92,
  filterReplacementRate: 78,
  documentationRate: 82,
  lastAuditDate: '2023-11-15',
  nextAuditDue: '2024-05-15',
  issues: [
    {
      severity: 'high',
      description: '3 units require immediate filter replacement'
    },
    {
      severity: 'medium',
      description: 'Service documentation incomplete for 2 units'
    },
    {
      severity: 'low',
      description: 'Schedule optimization recommended for efficiency'
    }
  ]
};

// Calculate how many units are due for filter replacement
export const getFilterComplianceStatus = (units: ACUnit[]) => {
  const totalUnits = units.length;
  const overdue = units.filter(unit => {
    const dueDate = new Date(unit.filterDueDate);
    const today = new Date();
    return dueDate < today;
  }).length;
  
  const dueSoon = units.filter(unit => {
    const dueDate = new Date(unit.filterDueDate);
    const today = new Date();
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    return dueDate > today && dueDate < twoWeeksFromNow;
  }).length;
  
  return {
    total: totalUnits,
    overdue,
    dueSoon,
    compliant: totalUnits - overdue - dueSoon
  };
};
