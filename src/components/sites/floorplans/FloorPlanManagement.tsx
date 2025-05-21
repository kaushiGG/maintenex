
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import FloorPlanUpload from './FloorPlanUpload';
import FloorPlanView from './FloorPlanView';

export interface FloorPlanManagementProps {
  siteId?: string;
}

const FloorPlanManagement: React.FC<FloorPlanManagementProps> = ({ siteId }) => {
  const [activeTab, setActiveTab] = useState('view');
  const [floorPlans, setFloorPlans] = useState<any[]>([]);

  const handleFloorPlanUploaded = (newFloorPlan: any) => {
    setFloorPlans(prev => [...prev, newFloorPlan]);
  };

  return (
    <div className="space-y-4">
      <Tabs defaultValue="view" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">View Floor Plans</TabsTrigger>
          <TabsTrigger value="upload">Upload Floor Plans</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-4">
          {floorPlans.length > 0 ? (
            floorPlans.map((plan, index) => (
              <FloorPlanView 
                key={plan.id || index}
                floorPlanUrl={plan.file_path}
                name={plan.name}
              />
            ))
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No floor plans available</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              <FloorPlanUpload
                siteId={siteId}
                onFloorPlanUploaded={handleFloorPlanUploaded}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FloorPlanManagement;
