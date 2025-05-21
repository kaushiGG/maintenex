import { z } from 'zod';

export const equipmentFormSchema = z.object({
  name: z.string().min(1, { message: 'Equipment name is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  location: z.string().min(1, { message: 'Location is required' }),
  status: z.string().min(1, { message: 'Status is required' }),
  serialNumber: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  notes: z.string().optional(),
  siteId: z.string().min(1, { message: 'Site is required' }),
});

export type EquipmentFormValues = z.infer<typeof equipmentFormSchema>;

export const equipmentCategories = [
  'HVAC',
  'Electrical',
  'Plumbing',
  'Fire Safety',
  'Security Systems',
  'Lighting',
  'IT Infrastructure',
  'Kitchen Equipment',
  'Office Equipment',
  'Furniture',
  'Building Structure',
  'Other'
];

export const equipmentStatuses = [
  'operational',
  'maintenance',
  'inactive'
] as const;

export type EquipmentStatus = typeof equipmentStatuses[number];

export const equipmentStatusLabels: Record<EquipmentStatus, string> = {
  operational: 'Operational',
  maintenance: 'Maintenance',
  inactive: 'Inactive'
};
