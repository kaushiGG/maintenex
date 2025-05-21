
export interface Asset {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  location: string;
  status: "active" | "maintenance" | "offline";
  purchaseDate: string;
  warrantyExpiry: string;
  nextServiceDate: string;
  notes: string;
  attachments: any[];
}
