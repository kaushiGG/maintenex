
import React from 'react';
import { Calendar } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Control } from 'react-hook-form';
import { EquipmentFormValues } from '../EquipmentFormSchema';
import FormSectionHeader from '../FormSectionHeader';

interface DateNotesSectionProps {
  control: Control<EquipmentFormValues>;
}

const DateNotesSection: React.FC<DateNotesSectionProps> = ({ control }) => {
  return (
    <>
      <FormSectionHeader icon={<Calendar className="h-4 w-4" />} title="Dates & Additional Information" />

      <FormField
        control={control}
        name="purchaseDate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Purchase Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="warrantyExpiry"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Warranty Expiry</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2">
        <FormField
          control={control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional details about the equipment"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};

export default DateNotesSection;
