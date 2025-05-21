
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { EquipmentItem } from '../types/equipment';
import { Map, Upload, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FloorPlanViewProps {
  equipment: EquipmentItem[];
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({ equipment }) => {
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [floorPlanUrl, setFloorPlanUrl] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setFloorPlan(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setFloorPlanUrl(url);
      toast.success('Floor plan uploaded successfully');
    }
  };

  const handleDownload = () => {
    if (floorPlanUrl) {
      const link = document.createElement('a');
      link.href = floorPlanUrl;
      link.download = floorPlan?.name || 'floorplan.png';
      link.click();
      toast.success('Floor plan downloaded');
    }
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <div className="bg-gray-100 rounded-full p-4">
            <Map className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium">Floor Plan View</h3>
          <p className="text-sm text-gray-500 mb-2">
            Upload a floor plan for better equipment management
          </p>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            className="mt-4 w-full max-w-xs"
          />
          {floorPlanUrl && (
            <div className="mt-4 w-full">
              <img src={floorPlanUrl} alt="Floor Plan" className="max-w-full h-auto border rounded-md mx-auto" />
              <Button onClick={handleDownload} className="mt-4">
                <Download className="h-4 w-4 mr-2" />
                Download Floor Plan
              </Button>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-2">
            {equipment.length} equipment items are available for this site.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FloorPlanView;
