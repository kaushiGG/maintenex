
import { z } from 'zod';

// Define the service type options as a constant for reuse
export const serviceTypeOptions = [
  'Test a Tag',
  'Emergency & Exit',
  'Thermal Imaging',
  'Fire Services',
  'Air Conditioning Service',
  'Lift Service',
  'Pest Control',
  'Cleaning',
  'Fire Safety Systems',
  'Electrical Systems',
  'Plumbing Systems',
  'RCD Testing',
  'Emergency Exit Maintenance',
  'Testing Tags',
  'Custom Service'
];

export const contractorFormSchema = z.object({
  name: z.string().min(3, { message: 'Contractor name must be at least 3 characters' }),
  serviceType: z.string().min(1, { message: 'Please select a service type' }),
  credentials: z.string().min(1, { message: 'Please select credentials status' }),
  status: z.string().min(1, { message: 'Please select contractor status' }),
  contactEmail: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  location: z.string().optional().or(z.literal('')),
  rating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().optional().or(z.literal('')),
});

export type ContractorFormData = z.infer<typeof contractorFormSchema>;
