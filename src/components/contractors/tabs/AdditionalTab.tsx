
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContractorFormData } from '../schemas/contractor-form-schema';

const AdditionalTab: React.FC = () => {
  const { control } = useFormContext<ContractorFormData>();

  return (
    <div className="space-y-4 pt-4">
      <FormField
        control={control}
        name="rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rating</FormLabel>
            <Select 
              onValueChange={(value) => field.onChange(value || undefined)}
              value={field.value?.toString() || ''}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select rating" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="">Not Rated</SelectItem>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Good</SelectItem>
                <SelectItem value="4">4 - Very Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Select a rating from 1 (Poor) to 5 (Excellent)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Additional notes about this contractor..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default AdditionalTab;
