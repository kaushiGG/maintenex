import { faker } from '@faker-js/faker';

export interface PlumbingAppliance {
  id: string;
  name: string;
  type: string;
  location: string;
  lastInspection: string;
  nextInspection: string;
  manufacturer: string;
  status: string;
  model: string;
  serialNumber: string;
  installationDate: string;
  notes: string;
}

export interface BackflowValve extends PlumbingAppliance {
  testPressure: string;
  certificateNumber: string;
  valveSize: string;
  valveType: string;
}

export interface ComplianceRecord {
  id: string;
  applianceId: string;
  certificateNumber: string;
  complianceDate: string;
  expiryDate: string;
  testResult: 'Pass' | 'Fail';
  testPressure: string;
  inspector: string;
  notes?: string;
}

const generateRandomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const locations = [
  'Basement - Plant Room',
  'Basement - Fire Room',
  'Ground Floor - East Garden',
  'Level 3 - Plant Room',
  'Level 2 - Kitchen',
  'Roof Level - Plant Area'
];

const manufacturers = [
  'Conbraco',
  'Watts',
  'Febco',
  'Apollo',
  'Zurn Wilkins'
];

export const plumbingAppliances: PlumbingAppliance[] = Array.from({ length: 28 }, (_, i) => ({
  id: `PLM-APP-${(i + 1).toString().padStart(3, '0')}`,
  name: `${faker.commerce.productName()} ${faker.helpers.arrayElement(['Heater', 'Pump', 'Valve', 'Filter', 'Cooler'])}`,
  type: faker.helpers.arrayElement(['Water Heater', 'Pump', 'Valve', 'Filter', 'Water Cooler']),
  location: faker.helpers.arrayElement(locations),
  lastInspection: generateRandomDate(new Date('2023-01-01'), new Date()),
  nextInspection: generateRandomDate(new Date(), new Date('2025-12-31')),
  manufacturer: faker.helpers.arrayElement(manufacturers),
  status: faker.helpers.arrayElement(['Compliant', 'Non-Compliant', 'Due Soon', 'Overdue']),
  model: faker.commerce.productMaterial() + faker.number.int({ min: 100, max: 999 }),
  serialNumber: faker.string.alphanumeric(10).toUpperCase(),
  installationDate: generateRandomDate(new Date('2015-01-01'), new Date('2023-01-01')),
  notes: faker.lorem.sentence(),
}));

export const getBackflowValves = (): BackflowValve[] => [
  {
    id: 'BNE-BFV-001',
    name: 'Main Water Supply Backflow',
    type: 'Reduced Pressure Zone Valve',
    location: 'Basement - Plant Room',
    lastInspection: '2024-01-12T00:00:00.000Z',
    nextInspection: '2025-01-12T00:00:00.000Z',
    manufacturer: 'Conbraco',
    status: 'Compliant',
    model: 'RPZ-40-200',
    serialNumber: 'CON123456789',
    installationDate: '2019-05-15T00:00:00.000Z',
    testPressure: '150 kPa',
    certificateNumber: 'BF-CERT-12345',
    valveSize: '40mm',
    valveType: 'RPZ',
    notes: 'Annual inspection completed. Valve functioning properly.',
  },
  {
    id: 'BNE-BFV-002',
    name: 'Fire System Backflow',
    type: 'Double Check Valve',
    location: 'Basement - Fire Room',
    lastInspection: '2024-02-15T00:00:00.000Z',
    nextInspection: '2025-02-15T00:00:00.000Z',
    manufacturer: 'Watts',
    status: 'Compliant',
    model: 'DC-50-300',
    serialNumber: 'WAT987654321',
    installationDate: '2018-11-20T00:00:00.000Z',
    testPressure: '200 kPa',
    certificateNumber: 'BF-CERT-23456',
    valveSize: '50mm',
    valveType: 'DCV',
    notes: 'Valve meets AS2845.1 requirements. No issues found.',
  },
  {
    id: 'BNE-BFV-003',
    name: 'Irrigation Backflow',
    type: 'Pressure Vacuum Breaker',
    location: 'Ground Floor - East Garden',
    lastInspection: '2024-03-08T00:00:00.000Z',
    nextInspection: '2025-03-08T00:00:00.000Z',
    manufacturer: 'Febco',
    status: 'Compliant',
    model: 'PVB-25-100',
    serialNumber: 'FEB567890123',
    installationDate: '2020-03-10T00:00:00.000Z',
    testPressure: '120 kPa',
    certificateNumber: 'BF-CERT-34567',
    valveSize: '25mm',
    valveType: 'PVB',
    notes: 'Vacuum breaker functioning correctly. Spring mechanism good.',
  },
  {
    id: 'BNE-BFV-004',
    name: 'HVAC Backflow',
    type: 'Reduced Pressure Zone Valve',
    location: 'Level 3 - Plant Room',
    lastInspection: '2023-04-20T00:00:00.000Z',
    nextInspection: '2024-04-20T00:00:00.000Z',
    manufacturer: 'Zurn Wilkins',
    status: 'Overdue',
    model: 'RPZ-32-150',
    serialNumber: 'ZUR678901234',
    installationDate: '2019-08-05T00:00:00.000Z',
    testPressure: '140 kPa',
    certificateNumber: 'BF-CERT-45678',
    valveSize: '32mm',
    valveType: 'RPZ',
    notes: 'Testing overdue. Reminder sent to facility manager.',
  },
  {
    id: 'BNE-BFV-005',
    name: 'Kitchen Backflow',
    type: 'Double Check Valve',
    location: 'Level 2 - Kitchen',
    lastInspection: '2023-12-15T00:00:00.000Z',
    nextInspection: '2024-12-15T00:00:00.000Z',
    manufacturer: 'Apollo',
    status: 'Due Soon',
    model: 'DC-20-100',
    serialNumber: 'APO789012345',
    installationDate: '2020-01-25T00:00:00.000Z',
    testPressure: '130 kPa',
    certificateNumber: 'BF-CERT-56789',
    valveSize: '20mm',
    valveType: 'DCV',
    notes: 'Minor wear on seals noted. Plan replacement during next service.',
  },
  {
    id: 'BNE-BFV-006',
    name: 'Cooling Tower Backflow',
    type: 'Reduced Pressure Zone Valve',
    location: 'Roof Level - Plant Area',
    lastInspection: '2023-05-10T00:00:00.000Z',
    nextInspection: '2024-05-10T00:00:00.000Z',
    manufacturer: 'Watts',
    status: 'Due Soon',
    model: 'RPZ-50-250',
    serialNumber: 'WAT890123456',
    installationDate: '2018-06-30T00:00:00.000Z',
    testPressure: '180 kPa',
    certificateNumber: 'BF-CERT-67890',
    valveSize: '50mm',
    valveType: 'RPZ',
    notes: 'Relief valve discharging slightly. Monitor during next test.',
  },
  {
    id: 'BNE-BFV-007',
    name: 'Boiler Backflow',
    type: 'Double Check Valve',
    location: 'Basement - Plant Room',
    lastInspection: '2023-09-22T00:00:00.000Z',
    nextInspection: '2024-09-22T00:00:00.000Z',
    manufacturer: 'Conbraco',
    status: 'Compliant',
    model: 'DC-40-200',
    serialNumber: 'CON901234567',
    installationDate: '2019-04-15T00:00:00.000Z',
    testPressure: '160 kPa',
    certificateNumber: 'BF-CERT-78901',
    valveSize: '40mm',
    valveType: 'DCV',
    notes: 'Valve in excellent condition. No issues detected.',
  },
  {
    id: 'BNE-BFV-008',
    name: 'Chemical Treatment Backflow',
    type: 'Reduced Pressure Zone Valve',
    location: 'Level 3 - Plant Room',
    lastInspection: '2023-11-05T00:00:00.000Z',
    nextInspection: '2024-11-05T00:00:00.000Z',
    manufacturer: 'Febco',
    status: 'Compliant',
    model: 'RPZ-25-120',
    serialNumber: 'FEB012345678',
    installationDate: '2020-07-10T00:00:00.000Z',
    testPressure: '140 kPa',
    certificateNumber: 'BF-CERT-89012',
    valveSize: '25mm',
    valveType: 'RPZ',
    notes: 'Recently serviced. All components functioning properly.',
  },
  {
    id: 'BNE-BFV-009',
    name: 'Amenities Backflow',
    type: 'Dual Check Valve',
    location: 'Level 2 - Kitchen',
    lastInspection: '2023-08-15T00:00:00.000Z',
    nextInspection: '2024-08-15T00:00:00.000Z',
    manufacturer: 'Apollo',
    status: 'Compliant',
    model: 'DCV-15-80',
    serialNumber: 'APO123450987',
    installationDate: '2019-12-01T00:00:00.000Z',
    testPressure: '110 kPa',
    certificateNumber: 'BF-CERT-90123',
    valveSize: '15mm',
    valveType: 'DuCV',
    notes: 'Basic model suitable for low hazard application.',
  },
  {
    id: 'BNE-BFV-010',
    name: 'Domestic Water Backflow',
    type: 'Reduced Pressure Zone Valve',
    location: 'Basement - Plant Room',
    lastInspection: '2023-03-28T00:00:00.000Z',
    nextInspection: '2024-03-28T00:00:00.000Z',
    manufacturer: 'Zurn Wilkins',
    status: 'Overdue',
    model: 'RPZ-32-140',
    serialNumber: 'ZUR234567890',
    installationDate: '2018-09-18T00:00:00.000Z',
    testPressure: '150 kPa',
    certificateNumber: 'BF-CERT-01234',
    valveSize: '32mm',
    valveType: 'RPZ',
    notes: 'Testing overdue. High priority for compliance.',
  },
  {
    id: 'BNE-BFV-011',
    name: 'Hot Water System Backflow',
    type: 'Double Check Valve',
    location: 'Level 1 - Plant Room',
    lastInspection: '2023-07-14T00:00:00.000Z',
    nextInspection: '2024-07-14T00:00:00.000Z',
    manufacturer: 'Watts',
    status: 'Compliant',
    model: 'DC-25-120',
    serialNumber: 'WAT345678901',
    installationDate: '2020-02-20T00:00:00.000Z',
    testPressure: '130 kPa',
    certificateNumber: 'BF-CERT-12345',
    valveSize: '25mm',
    valveType: 'DCV',
    notes: 'Operates at higher temperature. Special high-temp seals installed.',
  },
  {
    id: 'BNE-BFV-012',
    name: 'Solar System Backflow',
    type: 'Pressure Vacuum Breaker',
    location: 'Roof Level - Plant Area',
    lastInspection: '2023-10-30T00:00:00.000Z',
    nextInspection: '2024-10-30T00:00:00.000Z',
    manufacturer: 'Conbraco',
    status: 'Compliant',
    model: 'PVB-20-100',
    serialNumber: 'CON456789012',
    installationDate: '2021-01-15T00:00:00.000Z',
    testPressure: '120 kPa',
    certificateNumber: 'BF-CERT-23456',
    valveSize: '20mm',
    valveType: 'PVB',
    notes: 'UV-resistant model for roof installation. Working well.',
  }
];

// Mock compliance history records
const complianceRecords: ComplianceRecord[] = [
  {
    id: 'COMP-001',
    applianceId: 'BNE-BFV-001',
    certificateNumber: 'BF-CERT-12345-2024',
    complianceDate: '2024-01-12T00:00:00.000Z',
    expiryDate: '2025-01-12T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '150 kPa',
    inspector: 'John Smith (Lic: PL-12345)',
    notes: 'All components functioning as expected. Valve in good condition.'
  },
  {
    id: 'COMP-002',
    applianceId: 'BNE-BFV-001',
    certificateNumber: 'BF-CERT-12345-2023',
    complianceDate: '2023-01-15T00:00:00.000Z',
    expiryDate: '2024-01-15T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '150 kPa',
    inspector: 'John Smith (Lic: PL-12345)',
    notes: 'Minor wear on O-rings, but still functioning within parameters.'
  },
  {
    id: 'COMP-003',
    applianceId: 'BNE-BFV-002',
    certificateNumber: 'BF-CERT-23456-2024',
    complianceDate: '2024-02-15T00:00:00.000Z',
    expiryDate: '2025-02-15T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '200 kPa',
    inspector: 'Emily Johnson (Lic: PL-23456)',
    notes: 'Valve meets all requirements of AS2845.1'
  },
  {
    id: 'COMP-004',
    applianceId: 'BNE-BFV-003',
    certificateNumber: 'BF-CERT-34567-2024',
    complianceDate: '2024-03-08T00:00:00.000Z',
    expiryDate: '2025-03-08T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '120 kPa',
    inspector: 'Michael Williams (Lic: PL-34567)',
    notes: 'Vacuum breaker function verified. Spring tension measured and found compliant.'
  },
  {
    id: 'COMP-005',
    applianceId: 'BNE-BFV-004',
    certificateNumber: 'BF-CERT-45678-2023',
    complianceDate: '2023-04-20T00:00:00.000Z',
    expiryDate: '2024-04-20T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '140 kPa',
    inspector: 'Sarah Brown (Lic: PL-45678)',
    notes: null
  },
  {
    id: 'COMP-006',
    applianceId: 'BNE-BFV-005',
    certificateNumber: 'BF-CERT-56789-2023',
    complianceDate: '2023-12-15T00:00:00.000Z',
    expiryDate: '2024-12-15T00:00:00.000Z',
    testResult: 'Pass',
    testPressure: '130 kPa',
    inspector: 'David Miller (Lic: PL-56789)',
    notes: 'Slight wear on seals noted. Recommended replacement at next service.'
  }
];

// Function to get compliance history for a specific appliance
export const getComplianceHistory = (applianceId: string): ComplianceRecord[] => {
  return complianceRecords.filter(record => record.applianceId === applianceId);
};
