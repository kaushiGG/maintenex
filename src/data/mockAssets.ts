
import { Asset } from '@/types/asset';

export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Air Conditioning Unit',
    category: 'HVAC',
    manufacturer: 'Carrier',
    model: 'Infinity 98',
    serialNumber: 'AC-12345-XYZ',
    location: 'Building A, Floor 3',
    status: 'active',
    purchaseDate: '2022-04-15',
    warrantyExpiry: '2025-04-15',
    nextServiceDate: '2023-10-15',
    notes: 'Annual maintenance required',
    attachments: []
  },
  {
    id: '2',
    name: 'Security Camera System',
    category: 'Security',
    manufacturer: 'Hikvision',
    model: 'DS-2CD2T85G1-I5',
    serialNumber: 'SC-67890-ABC',
    location: 'Building B, Entrance',
    status: 'active',
    purchaseDate: '2022-01-10',
    warrantyExpiry: '2025-01-10',
    nextServiceDate: '2023-07-10',
    notes: 'Check camera alignment quarterly',
    attachments: []
  },
  {
    id: '3',
    name: 'Elevator',
    category: 'Transportation',
    manufacturer: 'Otis',
    model: 'GeN2',
    serialNumber: 'EL-54321-DEF',
    location: 'Building A, Central',
    status: 'maintenance',
    purchaseDate: '2020-11-20',
    warrantyExpiry: '2025-11-20',
    nextServiceDate: '2023-05-20',
    notes: 'Annual safety inspection due',
    attachments: []
  },
  {
    id: '4',
    name: 'Fire Alarm System',
    category: 'Safety',
    manufacturer: 'Honeywell',
    model: 'Notifier',
    serialNumber: 'FA-13579-GHI',
    location: 'Building C, All Floors',
    status: 'active',
    purchaseDate: '2021-08-05',
    warrantyExpiry: '2026-08-05',
    nextServiceDate: '2023-08-05',
    notes: 'Monthly tests required by regulations',
    attachments: []
  },
  {
    id: '5',
    name: 'Water Heater',
    category: 'Plumbing',
    manufacturer: 'Rheem',
    model: 'Performance Plus',
    serialNumber: 'WH-24680-JKL',
    location: 'Building B, Basement',
    status: 'active',
    purchaseDate: '2021-03-15',
    warrantyExpiry: '2024-03-15',
    nextServiceDate: '2023-09-15',
    notes: 'Annual descaling recommended',
    attachments: []
  }
];
