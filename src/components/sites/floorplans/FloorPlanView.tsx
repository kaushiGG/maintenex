import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getPublicFileUrl } from '@/utils/fileUpload';

interface FloorPlan {
  id: string;
  file_path: string;
  name: string;
  file_type?: string;
}

interface FloorPlanViewProps {
  siteId?: string;
  floorPlans: FloorPlan[];
  isLoading: boolean;
  onFloorPlansChange?: (floorPlans: FloorPlan[]) => void;
}

const FloorPlanView: React.FC<FloorPlanViewProps> = ({ 
  siteId, 
  floorPlans, 
  isLoading,
  onFloorPlansChange 
}) => {
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(true);

  // Get the public URL for an image
  const getImageUrl = (filePath: string) => {
    return getPublicFileUrl('floorplans', filePath);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (floorPlans.length === 0) {
    return (
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
          <p className="text-gray-500 text-center">No floor plans available.</p>
          <p className="text-gray-400 text-sm mt-2">Please upload a floor plan using the Upload tab.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {floorPlans.map((plan) => {
          const imageUrl = getImageUrl(plan.file_path);
          return (
            <Card 
              key={plan.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedPlan(plan)}
            >
              <CardContent className="p-4">
                <div className="aspect-video relative overflow-hidden rounded-md bg-gray-100 mb-2">
                  <img
                    src={imageUrl}
                    alt={plan.name}
                    className="object-cover w-full h-full"
                    onLoad={() => setIsImageLoading(false)}
                    onError={(e) => {
                      console.error(`Failed to load image: ${imageUrl}`);
                      (e.target as HTMLImageElement).src = '/placeholder-floor-plan.png';
                    }}
                  />
                </div>
                <p className="text-sm font-medium truncate">{plan.name}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedPlan && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <h3 className="text-lg font-medium mb-2">{selectedPlan.name}</h3>
            <div className="relative rounded-md overflow-hidden bg-gray-100">
              {isImageLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
              )}
              <img
                src={getImageUrl(selectedPlan.file_path)}
                alt={selectedPlan.name}
                className="w-full h-auto"
                onLoad={() => setIsImageLoading(false)}
                onError={(e) => {
                  console.error(`Failed to load image: ${getImageUrl(selectedPlan.file_path)}`);
                  (e.target as HTMLImageElement).src = '/placeholder-floor-plan.png';
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FloorPlanView; 
 