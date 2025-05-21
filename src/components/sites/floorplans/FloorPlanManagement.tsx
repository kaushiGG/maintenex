import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Upload, File, Edit, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { supabase } from '@/integrations/supabase/client';
import FloorPlanUpload from './FloorPlanUpload';
import FloorPlanView from './FloorPlanView';

interface FloorPlanManagementProps {
  siteId: string;
}

const FloorPlanManagement: React.FC<FloorPlanManagementProps> = ({ siteId }) => {
  const [selectedTab, setSelectedTab] = useState<string>('upload');
  const [floorPlans, setFloorPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFloorPlans = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('site_floor_plans')
          .select('*')
          .eq('site_id', siteId);

        if (error) {
          throw error;
        }

        setFloorPlans(data || []);
      } catch (error) {
        console.error('Error fetching floor plans:', error);
        toast.error('Failed to load floor plans');
      } finally {
        setIsLoading(false);
      }
    };

    if (siteId) {
      fetchFloorPlans();
    }
  }, [siteId]);

  const handleUploadSuccess = () => {
    // Refresh floor plans after a successful upload
    fetchFloorPlans();
  };

  const fetchFloorPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('site_floor_plans')
        .select('*')
        .eq('site_id', siteId);

      if (error) {
        throw error;
      }

      setFloorPlans(data || []);
    } catch (error) {
      console.error('Error fetching floor plans:', error);
      toast.error('Failed to load floor plans');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Floor Plan Management</CardTitle>
        <CardDescription>Upload and manage floor plans for this site.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Floor Plan Management</h1>
          <p className="text-sm text-gray-500">
            Upload and view floor plans for your business sites
          </p>
        </div>
        <Tabs defaultValue={selectedTab} className="space-y-4" onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload Floor Plan
            </TabsTrigger>
            <TabsTrigger value="view">
              <File className="mr-2 h-4 w-4" />
              View Floor Plans
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <FloorPlanUpload siteId={siteId} onUploadSuccess={handleUploadSuccess} />
          </TabsContent>
          <TabsContent value="view">
            <FloorPlanView siteId={siteId} floorPlans={floorPlans} isLoading={isLoading} onFloorPlansChange={setFloorPlans} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FloorPlanManagement;
