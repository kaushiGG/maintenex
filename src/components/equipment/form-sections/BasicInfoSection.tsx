import React from 'react';
import { Package, Clipboard } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from 'react-hook-form';
import { EquipmentFormValues, equipmentCategories, equipmentStatuses, equipmentStatusLabels } from '../EquipmentFormSchema';
import FormSectionHeader from '../FormSectionHeader';

interface BasicInfoSectionProps {
  control: Control<EquipmentFormValues>;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ control }) => {
  return (
    <>
      <FormSectionHeader icon={<Clipboard className="h-4 w-4" />} title="Basic Information" />

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Equipment Name*</FormLabel>
            <FormControl>
              <Input placeholder="Enter equipment name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {equipmentCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Building/Room/Area" 
                {...field} 
                className="flex items-center"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status*</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {equipmentStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {equipmentStatusLabels[status]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
