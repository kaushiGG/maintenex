
import React from 'react';
import { Building } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from 'react-hook-form';
import { EquipmentFormValues } from '../EquipmentFormSchema';
import FormSectionHeader from '../FormSectionHeader';
import SiteSelector from '../SiteSelector';

interface SiteSectionProps {
  control: Control<EquipmentFormValues>;
}

const SiteSection: React.FC<SiteSectionProps> = ({ control }) => {
  return (
    <>
      <FormSectionHeader icon={<Building className="h-4 w-4" />} title="Site Information" />
      
      <FormField
        control={control}
        name="siteId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Site*</FormLabel>
            <SiteSelector value={field.value} onChange={field.onChange} />
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default SiteSection;
