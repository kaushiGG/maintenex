export type AssetStatus = 'active' | 'maintenance' | 'inactive' | 'retired';

export interface UploadedFile {
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  equipmentId?: string;
  uploadedAt?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: AssetStatus;
  purchaseDate: string | null;
  warrantyExpiry: string | null;
  nextServiceDate: string | null;
  notes: string | null;
  attachments: UploadedFile[] | null;
  
  // Safety check fields
  safety_frequency?: string;
  safety_instructions?: string[];
  safety_officer?: string;
  training_video_url?: string;
  training_video_name?: string;
  safety_manager_id?: string;
  authorized_officers?: string[];
}
