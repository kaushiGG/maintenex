
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Map } from 'lucide-react';
import FloorPlanUpload from './FloorPlanUpload';
import FloorPlanViewer from './FloorPlanViewer';

interface EnhancedFloorPlanManagerProps {
  siteId?: string;
}

const EnhancedFloorPlanManager: React.FC<EnhancedFloorPlanManagerProps> = ({ siteId }) => {
  const [activeTab, setActiveTab] = useState<'view' | 'upload'>('view');

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'view' | 'upload')}>
        <TabsList className="mb-4">
          <TabsTrigger value="view" className="flex items-center">
            <Map className="h-4 w-4 mr-2" />
            View Floor Plans
          </TabsTrigger>
          <TabsTrigger value="upload" className="flex items-center">
            <Upload className="h-4 w-4 mr-2" />
            Upload Floor Plans
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          <Card>
            <CardContent className="p-4">
              <FloorPlanViewer siteId={siteId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="p-4">
              <FloorPlanUpload siteId={siteId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedFloorPlanManager;
