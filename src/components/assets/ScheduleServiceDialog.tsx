
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Asset } from '@/types/asset';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, AlertCircle, User } from 'lucide-react';

interface ScheduleServiceDialogProps {
  asset: Asset;
  isOpen: boolean;
  onClose: () => void;
}

// Form schema for service scheduling
const scheduleServiceSchema = z.object({
  serviceDate: z.string().min(1, { message: 'Service date is required' }),
  serviceType: z.string().min(1, { message: 'Service type is required' }),
  description: z.string().min(5, { message: 'Description must be at least 5 characters' }),
  assignedTo: z.string().min(1, { message: 'Assignee is required' }),
  priority: z.enum(['low', 'normal', 'high']),
  notes: z.string().optional(),
});

type ScheduleServiceFormValues = z.infer<typeof scheduleServiceSchema>;

// Mock service types - in a real app, these would come from a database
const serviceTypes = [
  'Regular Maintenance',
  'Inspection',
  'Repair',
  'Calibration',
  'Certification',
  'Software Update',
  'Hardware Upgrade',
  'Cleaning'
];

// Mock assignees - in a real app, these would come from a database
const assignees = [
  'Maintenance Team',
  'IT Department',
  'External Contractor',
  'Certification Office',
  'John Smith',
  'Sarah Johnson'
];

const ScheduleServiceDialog: React.FC<ScheduleServiceDialogProps> = ({ asset, isOpen, onClose }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize the form
  const form = useForm<ScheduleServiceFormValues>({
    resolver: zodResolver(scheduleServiceSchema),
    defaultValues: {
      serviceDate: new Date().toISOString().split('T')[0], // Today's date
      serviceType: '',
      description: '',
      assignedTo: '',
      priority: 'normal',
      notes: '',
    },
  });

  const onSubmit = async (values: ScheduleServiceFormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Scheduling service for equipment ID:", asset.id);
      
      // Update the equipment record with the next service date
      const { error: equipmentError } = await supabase
        .from('equipment')
        .update({
          next_service_date: values.serviceDate,
          // Add service information to the notes field
          notes: asset.notes 
            ? `${asset.notes}\n\nScheduled service (${values.serviceDate}): ${values.serviceType} - ${values.description}`
            : `Scheduled service (${values.serviceDate}): ${values.serviceType} - ${values.description}`
        })
        .eq('id', asset.id);

      if (equipmentError) {
        console.error('Error updating equipment:', equipmentError);
        toast.error('Failed to schedule service: ' + equipmentError.message);
        return;
      }

      // Create an entry in the scheduled_services table
      const { error: serviceError } = await supabase
        .from('scheduled_services')
        .insert({
          equipment_id: asset.id,
          service_date: values.serviceDate,
          service_type: values.serviceType,
          description: values.description,
          assigned_to: values.assignedTo,
          priority: values.priority,
          notes: values.notes,
          status: 'scheduled'
        });

      if (serviceError) {
        console.error('Error creating scheduled service:', serviceError);
        toast.error('Failed to create service record: ' + serviceError.message);
        return;
      }

      // Create an entry in the jobs table for the service
      const { error: jobError } = await supabase
        .from('jobs')
        .insert({
          title: `${values.serviceType} for ${asset.name}`,
          description: values.description,
          service_type: values.serviceType,
          site_id: null, // This would be set in a real app
          assigned_to: values.assignedTo,
          due_date: new Date(values.serviceDate).toISOString(),
          status: 'pending'
        });

      if (jobError) {
        // Log error but don't show to user since we've already updated the equipment record
        console.error('Error creating job:', jobError);
      }

      toast.success('Service scheduled successfully');
      onClose();
      
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Schedule Service for {asset.name}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serviceDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Date</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input type="date" className="pl-9" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex items-center">
                            <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select priority" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="serviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select service type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {serviceTypes.map(type => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assigned To</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-muted-foreground" />
                            <SelectValue placeholder="Select assignee" />
                          </div>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignees.map(assignee => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the service to be performed"
                      className="min-h-[60px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any additional information (optional)"
                      className="min-h-[80px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Scheduling...' : 'Schedule Service'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleServiceDialog;
