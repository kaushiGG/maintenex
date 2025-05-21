
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImage, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloorPlan {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
}

interface FloorPlanViewerProps {
  siteId?: string;
}

const FloorPlanViewer: React.FC<FloorPlanViewerProps> = ({ siteId }) => {
  const [floorPlans, setFloorPlans] = useState<FloorPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<FloorPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFloorPlans = async () => {
      if (!siteId) {
        setFloorPlans([]);
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('site_floor_plans')
          .select('*')
          .eq('site_id', siteId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setFloorPlans(data || []);
        
        // Select the first plan by default if available
        if (data && data.length > 0) {
          setSelectedPlan(data[0]);
        }
        
      } catch (err: any) {
        console.error('Error fetching floor plans:', err);
        setError(err.message || 'Failed to load floor plans');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFloorPlans();
  }, [siteId]);

  const handleSelectPlan = (plan: FloorPlan) => {
    setSelectedPlan(plan);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-600">Loading floor plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
        <h3 className="text-lg font-medium text-red-900">Failed to load floor plans</h3>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (floorPlans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileImage className="h-16 w-16 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No Floor Plans Available</h3>
        <p className="text-sm text-gray-600 mt-1 max-w-md">
          {siteId 
            ? "No floor plans have been uploaded for this site yet. Use the 'Upload Floor Plans' tab to add floor plans."
            : "Please select a site to view floor plans."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Floor Plans</h2>
        <p className="text-sm text-gray-500">
          View and manage floor plans for this site.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/4">
          <h3 className="text-sm font-medium mb-2">Available Floor Plans</h3>
          <div className="space-y-2">
            {floorPlans.map((plan) => (
              <div 
                key={plan.id}
                className={`flex items-center p-3 rounded-md cursor-pointer hover:bg-gray-100 ${
                  selectedPlan?.id === plan.id ? 'bg-purple-50 border border-purple-200' : ''
                }`}
                onClick={() => handleSelectPlan(plan)}
              >
                <FileImage className={`h-5 w-5 mr-2 ${
                  selectedPlan?.id === plan.id ? 'text-purple-600' : 'text-gray-500'
                }`} />
                <div className="overflow-hidden">
                  <p className="font-medium text-sm truncate">{plan.name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(plan.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="w-full md:w-3/4 border rounded-lg p-4 bg-gray-50 min-h-[400px] flex items-center justify-center">
          {selectedPlan ? (
            <div className="text-center">
              <h3 className="font-medium mb-2">{selectedPlan.name}</h3>
              <p className="text-sm text-gray-500 mb-4">
                The actual floor plan viewer would display the image here.
              </p>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white">
                <FileImage className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">
                  Floor plan preview placeholder
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  File path: {selectedPlan.file_path}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-500">Select a floor plan to view</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorPlanViewer;
