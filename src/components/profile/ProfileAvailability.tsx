
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import { Database } from '@/integrations/supabase/types';

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

type DbAvailability = Database['public']['Tables']['contractor_availability']['Row'];

interface AvailabilityState {
  owner_id: string;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

const defaultAvailability: AvailabilityState = {
  owner_id: '',
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

const ProfileAvailability = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityState>({
    ...defaultAvailability,
    owner_id: user?.id || '',
  });
  const [availabilityId, setAvailabilityId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchAvailability();
    }
  }, [user]);

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractor_availability')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No availability record found, using defaults.');
        } else {
          throw error;
        }
      }

      if (data) {
        setAvailabilityId(data.id);
        const parsedData: AvailabilityState = {
          owner_id: data.owner_id,
          monday: Boolean(data.monday),
          tuesday: Boolean(data.tuesday),
          wednesday: Boolean(data.wednesday),
          thursday: Boolean(data.thursday),
          friday: Boolean(data.friday),
          saturday: Boolean(data.saturday),
          sunday: Boolean(data.sunday),
        };
        setAvailability(parsedData);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast({
        title: "Error",
        description: "Failed to load availability settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityChange = (day: string, value: boolean) => {
    const lowerDay = day.toLowerCase() as keyof Omit<AvailabilityState, 'owner_id'>;
    setAvailability(prev => ({
      ...prev,
      [lowerDay]: value
    }));
  };

  const saveChanges = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }

    console.log('Saving availability changes...', availability);
    setSaving(true);
    try {
      let result;
      
      if (availabilityId) {
        // If we have an ID, update the existing record
        const updateResult = await supabase
          .from('contractor_availability')
          .update({
            monday: availability.monday,
            tuesday: availability.tuesday,
            wednesday: availability.wednesday,
            thursday: availability.thursday,
            friday: availability.friday,
            saturday: availability.saturday,
            sunday: availability.sunday,
          })
          .eq('id', availabilityId)
          .select();
          
        result = updateResult;
      } else {
        // If no ID, create a new record
        const insertResult = await supabase
          .from('contractor_availability')
          .insert({
            owner_id: user.id,
            monday: availability.monday,
            tuesday: availability.tuesday,
            wednesday: availability.wednesday,
            thursday: availability.thursday,
            friday: availability.friday,
            saturday: availability.saturday,
            sunday: availability.sunday,
          })
          .select();
          
        result = insertResult;
        
        // Save the ID for future updates
        if (result.data && result.data.length > 0) {
          setAvailabilityId(result.data[0].id);
        }
      }

      console.log('Supabase response:', result);

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: "Availability settings saved successfully.",
      });
    } catch (error) {
      console.error('Error saving availability:', error);
      toast({
        title: "Error",
        description: "Failed to save availability settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-lg text-gray-500">Loading availability settings...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          onClick={saveChanges}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar size={20} className="text-pretance-purple" />
              Work Schedule
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Set your availability for each day
            </p>
          </div>
          
          <div className="space-y-4">
            {days.map(day => {
              const lowerDay = day.toLowerCase() as keyof Omit<AvailabilityState, 'owner_id'>;
              const isAvailable = availability[lowerDay];

              return (
                <div key={day} className="flex items-center gap-4">
                  <div className="w-28">
                    <Label className="font-medium">{day}</Label>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch 
                      checked={isAvailable}
                      onCheckedChange={(checked) => 
                        handleAvailabilityChange(day, checked)
                      }
                    />
                    <span className="text-sm text-gray-600">
                      {isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileAvailability;
