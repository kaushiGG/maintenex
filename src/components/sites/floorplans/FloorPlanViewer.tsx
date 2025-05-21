import React from 'react';
import EnhancedFloorPlanManager from './EnhancedFloorPlanManager';

interface FloorPlanViewerProps {
  siteId?: string;
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ siteId }) => {
  return <EnhancedFloorPlanManager />;
};

export default FloorPlanViewer; 