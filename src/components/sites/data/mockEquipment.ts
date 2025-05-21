
import { EquipmentItem } from '../types/equipment';

export const mockEquipment: EquipmentItem[] = [
  {
    id: 'eq-001',
    name: 'HVAC System - Main Floor',
    category: 'Climate Control',
    location: 'Plant Room A',
    status: 'operational',
    lastServiced: new Date('2023-09-15'),
    nextService: new Date('2024-03-15'),
    siteId: '1'
  },
  {
    id: 'eq-002',
    name: 'Emergency Generator',
    category: 'Power',
    location: 'Basement',
    status: 'operational',
    lastServiced: new Date('2023-11-05'),
    nextService: new Date('2024-05-05'),
    siteId: '1'
  },
  {
    id: 'eq-003',
    name: 'Fire Alarm Panel',
    category: 'Safety',
    location: 'Security Office',
    status: 'maintenance',
    lastServiced: new Date('2023-12-10'),
    nextService: new Date('2024-02-15'),
    siteId: '1'
  },
  {
    id: 'eq-004',
    name: 'Server Rack',
    category: 'IT',
    location: 'Server Room',
    status: 'operational',
    lastServiced: new Date('2023-10-20'),
    nextService: new Date('2024-04-20'),
    siteId: '2'
  },
  {
    id: 'eq-005',
    name: 'Water Heater',
    category: 'Plumbing',
    location: 'Utility Room',
    status: 'offline',
    lastServiced: new Date('2023-08-15'),
    nextService: new Date('2024-02-15'),
    siteId: '2'
  }
];

// Helper function to get unique categories
export const getUniqueCategories = (): string[] => {
  return Array.from(new Set(mockEquipment.map(item => item.category)));
};

// Helper function to filter equipment
export const filterEquipment = (
  siteId: string,
  searchQuery: string = '',
  statusFilter: string = 'all',
  categoryFilter: string = 'all'
): EquipmentItem[] => {
  return mockEquipment.filter(item => {
    const matchesSite = item.siteId === siteId;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    return matchesSite && matchesSearch && matchesStatus && matchesCategory;
  });
};
