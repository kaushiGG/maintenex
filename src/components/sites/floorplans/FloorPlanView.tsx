
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, Download } from 'lucide-react';

interface FloorPlanViewProps {
  floorPlanUrl?: string;
  name?: string;
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({ floorPlanUrl, name = 'Floor Plan' }) => {
  return (
    <div className="bg-white rounded-md p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">{name}</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            View
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-md overflow-hidden">
        {floorPlanUrl ? (
          <img 
            src={floorPlanUrl} 
            alt={`${name} preview`}
            className="w-full object-contain"
            style={{ maxHeight: '300px' }}
          />
        ) : (
          <div className="bg-gray-100 h-64 flex items-center justify-center">
            <p className="text-gray-500">No floor plan available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloorPlanView;
