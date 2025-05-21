
// Mock data for the RCD Testing Service

export const rcdEquipmentData = [
  {
    id: 1,
    name: 'Main Distribution Board RCD',
    location: 'Electrical Room',
    lastTest: '12/03/2023',
    status: 'passed',
    compliance: '100%',
    nextTest: '12/03/2024'
  },
  {
    id: 2,
    name: 'Kitchen Circuit RCD',
    location: 'Kitchen',
    lastTest: '15/04/2023',
    status: 'failed',
    compliance: '0%',
    nextTest: 'Immediate action required'
  },
  {
    id: 3,
    name: 'Office Area RCD',
    location: 'Office 101',
    lastTest: '23/05/2023',
    status: 'passed',
    compliance: '100%',
    nextTest: '23/05/2024'
  },
  {
    id: 4,
    name: 'External Power RCD',
    location: 'Building Exterior',
    lastTest: '08/06/2023',
    status: 'warning',
    compliance: '60%',
    nextTest: 'Within 30 days'
  },
  {
    id: 5,
    name: 'Server Room RCD',
    location: 'IT Department',
    lastTest: '17/02/2023',
    status: 'passed',
    compliance: '100%',
    nextTest: '17/02/2024'
  }
];

export const testHistory = [
  {
    year: 2023,
    testsCompleted: 45,
    passRate: '78%',
    failRate: '12%',
    warningRate: '10%',
    compliance: '78%'
  },
  {
    year: 2022,
    testsCompleted: 42,
    passRate: '85%',
    failRate: '10%',
    warningRate: '5%',
    compliance: '85%'
  },
  {
    year: 2021,
    testsCompleted: 40,
    passRate: '82%',
    failRate: '15%',
    warningRate: '3%',
    compliance: '82%'
  }
];
