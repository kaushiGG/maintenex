import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Site, ComplianceStatus } from '@/types/site';
import { debounce } from 'lodash';

const siteFormSchema = z.object({
  name: z.string().min(2, { message: 'Site name must be at least 2 characters' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters' }),
  complianceStatus: z.enum(['compliant', 'warning', 'non-compliant', 'pending']).optional(),
  coordinates: z.string().optional(),
  site_type: z.string().optional(),
  contact_email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  notes: z.string().optional(),
});

type SiteFormValues = z.infer<typeof siteFormSchema>;

interface AddEditSiteFormProps {
  site?: Site;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddEditSiteForm({ site, onSuccess, onCancel }: AddEditSiteFormProps) {
  const { user } = useAuth();
  const isEditing = !!site?.id;
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  
  const form = useForm<SiteFormValues>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      name: site?.name || '',
      address: site?.address || '',
      complianceStatus: site?.complianceStatus || 'compliant',
      coordinates: site?.coordinates || '',
      site_type: site?.site_type || 'office',
      contact_email: site?.contact_email || '',
      contact_phone: site?.contact_phone || '',
      notes: site?.notes || '',
    },
  });

  const fetchAddressSuggestions = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    
    setIsLoadingAddresses(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ' Australia')}&countrycodes=au&limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        const suggestions = data.map((item: any) => item.display_name);
        setAddressSuggestions(suggestions);
      } else {
        console.error('Failed to fetch address suggestions');
        setAddressSuggestions([]);
      }
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      setAddressSuggestions([]);
    } finally {
      setIsLoadingAddresses(false);
    }
  };
  
  const debouncedFetchSuggestions = debounce(fetchAddressSuggestions, 500);
  
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('address', value);
    
    if (value.length >= 3) {
      debouncedFetchSuggestions(value);
    } else {
      setAddressSuggestions([]);
    }
  };
  
  const handleSelectSuggestion = (address: string) => {
    form.setValue('address', address);
    setAddressSuggestions([]);
  };

  const onSubmit = async (data: SiteFormValues) => {
    if (!user) {
      toast.error('You must be logged in to add or edit sites');
      return;
    }

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('business_sites')
          .update({
            name: data.name,
            address: data.address,
            compliance_status: data.complianceStatus,
            coordinates: data.coordinates,
            site_type: data.site_type,
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            notes: data.notes,
            updated_at: new Date().toISOString(),
          })
          .eq('id', site.id);

        if (error) throw error;
        toast.success('Site updated successfully');
      } else {
        const { error } = await supabase
          .from('business_sites')
          .insert({
            name: data.name,
            address: data.address,
            compliance_status: data.complianceStatus || 'compliant',
            coordinates: data.coordinates,
            site_type: data.site_type || 'office',
            contact_email: data.contact_email,
            contact_phone: data.contact_phone,
            notes: data.notes,
            owner_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (error) throw error;
        toast.success('Site added successfully');
      }
      
      onSuccess();
    } catch (error: any) {
      console.error('Error saving site:', error);
      toast.error(error.message || 'Failed to save site');
    }
  };

  const siteTypes = [
    { value: 'office', label: 'Office' },
    { value: 'warehouse', label: 'Warehouse' },
    { value: 'retail', label: 'Retail' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'residential', label: 'Residential' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter site name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="relative">
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Type to search for address" 
                    {...field} 
                    onChange={handleAddressChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {addressSuggestions.length > 0 && (
            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
              <ul className="py-1">
                {addressSuggestions.map((address, index) => (
                  <li
                    key={index}
                    className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleSelectSuggestion(address)}
                  >
                    {address}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {isLoadingAddresses && (
            <div className="absolute right-3 top-9">
              <div className="animate-spin h-4 w-4 border-2 border-purple-500 rounded-full border-t-transparent"></div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="site_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Site Type</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {siteTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
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
            name="complianceStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compliance Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select compliance status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contact_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input placeholder="contact@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="(123) 456-7890" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="coordinates"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Coordinates (optional)</FormLabel>
              <FormControl>
                <Input placeholder="e.g. -27.4705, 153.0260" {...field} />
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional information about this site" 
                  className="min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
          <Button type="submit" className="bg-[#3b82f6] hover:bg-[#2563eb]">
            {isEditing ? 'Update Site' : 'Add Site'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
