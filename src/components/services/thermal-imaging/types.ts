
export interface ThermalReading {
  id: string;
  date: string;
  imageUrl: string;
  temperature: number;
  notes: string;
  analyst: string;
}

export interface ThermalImageItem {
  id: string;
  name: string;
  type: 'switchboard' | 'preventative';
  location: string;
  status: 'passed' | 'failed';
  lastScanned: string;
  readings: ThermalReading[];
  notes?: string;
}
