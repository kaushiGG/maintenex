import React from 'react';
import EnhancedFloorPlanManager from './EnhancedFloorPlanManager';

interface FloorPlanUploadProps {
  siteId?: string;
  onFloorPlanUploaded?: (floorPlan: any) => void;
}

const FloorPlanUpload: React.FC<FloorPlanUploadProps> = ({ siteId, onFloorPlanUploaded }) => {
  return <EnhancedFloorPlanManager />;
};

export default FloorPlanUpload; 