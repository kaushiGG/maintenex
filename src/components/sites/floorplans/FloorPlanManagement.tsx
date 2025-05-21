
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import FloorPlanUpload from './FloorPlanUpload';
import FloorPlanView from './FloorPlanView';

export interface FloorPlanManagementProps {
  siteId?: string;
}

const FloorPlanManagement: React.FC<FloorPlanManagementProps> = ({ siteId }) => {
  const [activeTab, setActiveTab] = useState('view');
  const [floorPlans, setFloorPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (siteId) {
      fetchFloorPlans();
    } else {
      setLoading(false);
    }
  }, [siteId]);

  const fetchFloorPlans = async () => {
    try {
      setLoading(true);
      
      const query = supabase
        .from('site_floor_plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (siteId) {
        query.eq('site_id', siteId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      setFloorPlans(data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      toast.error('Failed to load floor plans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="view">View Floor Plans</TabsTrigger>
          <TabsTrigger value="upload">Upload Floor Plan</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
              ) : floorPlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {floorPlans.map((plan) => (
                    <FloorPlanView 
                      key={plan.id}
                      floorPlanUrl={plan.file_path}
                      name={plan.name}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No floor plans available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    {siteId ? 'Upload floor plans using the Upload tab.' : 'Select a site to view its floor plans.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="upload">
          <Card>
            <CardContent className="pt-6">
              {siteId ? (
                <FloorPlanUpload siteId={siteId} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No site selected</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Please select a site first to upload floor plans.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FloorPlanManagement;
