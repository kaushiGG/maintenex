
export type EquipmentStatus = 'operational' | 'maintenance' | 'offline';

export interface EquipmentItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: EquipmentStatus;
  lastServiced?: Date;
  nextService?: Date;
  siteId: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
}
