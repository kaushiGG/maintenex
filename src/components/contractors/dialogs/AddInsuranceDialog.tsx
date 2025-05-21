import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Shield, Briefcase, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Define the form schema
const formSchema = z.object({
  contractorName: z.string().min(1, 'Contractor name is required'),
  insuranceType: z.string().min(1, 'Insurance type is required'),
  provider: z.string().min(1, 'Provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  coverage: z.string().min(1, 'Coverage amount is required'),
  issueDate: z.string().min(1, 'Issue date is required'),
  expiryDate: z.string().min(1, 'Expiry date is required'),
  notes: z.string().optional(),
});

// Insurance type options with icons
const insuranceTypes = [
  { value: 'Public Liability', label: 'Public Liability', icon: Shield },
  { value: 'Professional Indemnity', label: 'Professional Indemnity', icon: FileText },
  { value: 'Workers Compensation', label: 'Workers Compensation', icon: Briefcase },
  { value: 'Product Liability', label: 'Product Liability', icon: Shield },
  { value: 'Business Insurance', label: 'Business Insurance', icon: Briefcase },
  { value: 'Equipment Insurance', label: 'Equipment Insurance', icon: FileText },
  { value: 'Cyber Insurance', label: 'Cyber Insurance', icon: Shield },
];

interface AddInsuranceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddInsurance: (data: any) => void;
}

const AddInsuranceDialog = ({ open, onOpenChange, onAddInsurance }: AddInsuranceDialogProps) => {
  const [contractors, setContractors] = useState<{ id: string, name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contractorName: '',
      insuranceType: '',
      provider: '',
      policyNumber: '',
      coverage: '',
      issueDate: '',
      expiryDate: '',
      notes: '',
    },
  });

  // Fetch contractors from the database when the dialog opens
  useEffect(() => {
    if (open) {
      fetchContractors();
    }
  }, [open]);

  const fetchContractors = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('id, name')
        .order('name');

      if (error) {
        throw error;
      }

      setContractors(data || []);
    } catch (error) {
      console.error('Error fetching contractors:', error);
      toast.error('Failed to load contractors');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    onAddInsurance(data);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Insurance</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contractorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contractor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contractor" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoading ? (
                          <SelectItem value="loading" disabled>
                            Loading contractors...
                          </SelectItem>
                        ) : contractors.length > 0 ? (
                          contractors.map((contractor) => (
                            <SelectItem key={contractor.id} value={contractor.name}>
                              {contractor.name}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-contractors" disabled>
                            No contractors found
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="insuranceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select insurance type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {insuranceTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center">
                                <Icon className="mr-2 h-4 w-4" />
                                <span>{type.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter insurance provider" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="policyNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Policy Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter policy number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="coverage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coverage Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., $1,000,000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional information"
                      className="resize-none"
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
                onClick={() => {
                  form.reset();
                  onOpenChange(false);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                Add Insurance
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddInsuranceDialog;
