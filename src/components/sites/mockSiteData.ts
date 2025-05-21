
import { ComplianceStatus, Site } from '@/types/site';

export const mockSites: Record<string, Site> = {
  '1': { 
    id: '1', 
    name: 'Brisbane Office', 
    address: '123 Brisbane St, Brisbane QLD',
    itemCount: 45,
    complianceStatus: 'compliant',
    assignedContractors: ['Brisbane Electrics', 'QLD Maintenance'],
    coordinates: '-27.4705,153.0260' // Brisbane coordinates
  },
  '2': { 
    id: '2', 
    name: 'Sydney Headquarters', 
    address: '456 Sydney Rd, Sydney NSW',
    itemCount: 72,
    complianceStatus: 'warning',
    assignedContractors: ['Sydney Services', 'NSW Electrics'],
    coordinates: '-33.8688,151.2093' // Sydney coordinates
  },
  '3': { 
    id: '3', 
    name: 'Melbourne Branch', 
    address: '789 Melbourne Ave, Melbourne VIC',
    itemCount: 38,
    complianceStatus: 'non-compliant',
    assignedContractors: ['Melbourne Maintenance'],
    coordinates: '-37.8136,144.9631' // Melbourne coordinates
  },
  '4': { 
    id: '4', 
    name: 'Perth Office', 
    address: '321 Perth Blvd, Perth WA',
    itemCount: 29,
    complianceStatus: 'compliant',
    assignedContractors: ['Perth Services', 'WA Electrics'],
    coordinates: '-31.9505,115.8605' // Perth coordinates
  },
  '5': { 
    id: '5', 
    name: 'Adelaide Center', 
    address: '654 Adelaide Ln, Adelaide SA',
    itemCount: 31,
    complianceStatus: 'warning',
    assignedContractors: ['Adelaide Maintenance'],
    coordinates: '-34.9285,138.6007' // Adelaide coordinates
  },
  '6': { 
    id: '6', 
    name: 'Gold Coast Facility', 
    address: '987 Gold Coast Hwy, Gold Coast QLD',
    itemCount: 24,
    complianceStatus: 'compliant',
    assignedContractors: ['Gold Coast Services', 'QLD Electrics'],
    coordinates: '-28.0167,153.4000' // Gold Coast coordinates
  }
};

export const serviceTypes = {
  'test-a-tag': { name: 'Testing Tags', icon: 'Tag', color: 'bg-blue-100 text-blue-600' },
  'rcd': { name: 'RCD Testing', icon: 'Zap', color: 'bg-yellow-100 text-yellow-600' },
  'emergency-exit': { name: 'Emergency & Exit', icon: 'AlertTriangle', color: 'bg-red-100 text-red-600' },
  'thermal-imaging': { name: 'Thermal Imaging', icon: 'Thermometer', color: 'bg-purple-100 text-purple-600' },
  'fire-services': { name: 'Fire Services', icon: 'Flame', color: 'bg-orange-100 text-orange-600' },
  'air-conditioning': { name: 'Air Conditioning', icon: 'Wind', color: 'bg-cyan-100 text-cyan-600' },
  'plumbing': { name: 'Plumbing', icon: 'Droplet', color: 'bg-blue-100 text-blue-600' },
  'lift-services': { name: 'Lift Services', icon: 'Wrench', color: 'bg-gray-100 text-gray-600' },
  'pest-control': { name: 'Pest Control', icon: 'BugOff', color: 'bg-green-100 text-green-600' },
  'cleaning': { name: 'Cleaning', icon: 'ClipboardList', color: 'bg-teal-100 text-teal-600' }
};

export const generateMockItems = (siteId: string, serviceType: string) => {
  const items = [];
  const count = Math.floor(Math.random() * 10) + 5;
  
  for (let i = 1; i <= count; i++) {
    const testResult = Math.random() > 0.2;
    items.push({
      id: `${siteId}-${serviceType}-${i}`,
      itemNumber: `${serviceType.substring(0, 3).toUpperCase()}-${siteId}-${i.toString().padStart(3, '0')}`,
      name: `${getItemName(serviceType)} ${i}`,
      location: `Level ${Math.floor(Math.random() * 5) + 1}, ${['Room', 'Office', 'Area', 'Zone'][Math.floor(Math.random() * 4)]} ${Math.floor(Math.random() * 50) + 1}`,
      lastInspected: new Date(Date.now() - Math.floor(Math.random() * 90 * 24 * 60 * 60 * 1000)),
      nextInspection: new Date(Date.now() + Math.floor(Math.random() * 180 * 24 * 60 * 60 * 1000)),
      status: testResult ? 'Passed' : 'Failed',
      description: `${getItemName(serviceType)} located in ${['main area', 'back office', 'reception', 'hallway'][Math.floor(Math.random() * 4)]}`,
      documents: Math.floor(Math.random() * 5),
      images: Math.floor(Math.random() * 8)
    });
  }
  
  return items;
};

const getItemName = (serviceType: string) => {
  const itemNames = {
    'test-a-tag': ['Power Board', 'Extension Cable', 'Desktop Computer', 'Printer', 'Microwave', 'Refrigerator'],
    'rcd': ['RCD Switch', 'Circuit Breaker', 'Power Supply', 'Distribution Board'],
    'emergency-exit': ['Exit Sign', 'Emergency Light', 'Fire Door', 'Evacuation Plan'],
    'thermal-imaging': ['Electrical Panel', 'HVAC Component', 'Motor', 'Transformer'],
    'fire-services': ['Fire Extinguisher', 'Sprinkler Head', 'Smoke Detector', 'Fire Alarm'],
    'air-conditioning': ['AC Unit', 'Cooling System', 'Ventilation Fan', 'Air Handler'],
    'lift-services': ['Elevator', 'Lift Motor', 'Control Panel', 'Door Mechanism'],
    'pest-control': ['Bait Station', 'Monitoring Point', 'Treatment Area', 'Exclusion Point'],
    'cleaning': ['Carpet Area', 'Window', 'Restroom', 'Kitchen']
  };
  
  const options = itemNames[serviceType as keyof typeof itemNames] || ['Item'];
  return options[Math.floor(Math.random() * options.length)];
};
