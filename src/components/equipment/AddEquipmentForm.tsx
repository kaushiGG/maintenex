
import React from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useEquipmentForm } from './hooks/useEquipmentForm';
import SiteSection from './form-sections/SiteSection';
import BasicInfoSection from './form-sections/BasicInfoSection';
import EquipmentDetailsSection from './form-sections/EquipmentDetailsSection';
import DateNotesSection from './form-sections/DateNotesSection';
import FileUploadSection from './FileUploadSection';
import { EquipmentFormValues } from './EquipmentFormSchema';

interface AddEquipmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: EquipmentFormValues) => void;
}

const AddEquipmentForm: React.FC<AddEquipmentFormProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const {
    form,
    isSubmitting,
    uploadedFiles,
    setUploadedFiles,
    isUploading,
    setIsUploading,
    handleSubmit
  } = useEquipmentForm({ onSave, onClose });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md md:max-w-lg w-full overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold flex items-center">
            <span className="mr-2">Add New Equipment</span>
          </SheetTitle>
          <SheetDescription>
            Fill in the details to add new equipment to your inventory.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Site Selection Section */}
              <SiteSection control={form.control} />

              {/* Basic Information Section */}
              <BasicInfoSection control={form.control} />

              {/* Equipment Details Section */}
              <EquipmentDetailsSection control={form.control} />

              {/* Dates & Additional Information Section */}
              <DateNotesSection control={form.control} />

              {/* File Upload Section */}
              <FileUploadSection 
                uploadedFiles={uploadedFiles}
                setUploadedFiles={setUploadedFiles}
                isUploading={isUploading}
                setIsUploading={setIsUploading}
              />
            </div>

            <SheetFooter className="flex justify-between gap-2 sm:justify-between">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || isUploading}>
                <Save className="mr-2 h-4 w-4" />
                {isSubmitting ? 'Saving...' : 'Save Equipment'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
};

export default AddEquipmentForm;
