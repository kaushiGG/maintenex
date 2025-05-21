
import React from 'react';
import { Tag } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from 'react-hook-form';
import { EquipmentFormValues } from '../EquipmentFormSchema';
import FormSectionHeader from '../FormSectionHeader';

interface EquipmentDetailsSectionProps {
  control: Control<EquipmentFormValues>;
}

const EquipmentDetailsSection: React.FC<EquipmentDetailsSectionProps> = ({ control }) => {
  return (
    <>
      <FormSectionHeader icon={<Tag className="h-4 w-4" />} title="Equipment Details" />

      <FormField
        control={control}
        name="manufacturer"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Manufacturer</FormLabel>
            <FormControl>
              <Input placeholder="Manufacturer name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Model</FormLabel>
            <FormControl>
              <Input placeholder="Model number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="serialNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Serial Number</FormLabel>
            <FormControl>
              <Input placeholder="Serial number" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default EquipmentDetailsSection;
