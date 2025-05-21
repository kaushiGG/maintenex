import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { UploadedFile, ensureBucketPermissions } from '@/utils/fileUpload';
import { equipmentFormSchema, EquipmentFormValues } from '../EquipmentFormSchema';
import { useAuth } from '@/context/AuthContext';

interface UseEquipmentFormProps {
  onSave?: (data: EquipmentFormValues) => void;
  onClose: () => void;
}

export const useEquipmentForm = ({ onSave, onClose }: UseEquipmentFormProps) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Check if the equipments bucket exists and create it if not
  useEffect(() => {
    const setupStorage = async () => {
      if (user) {
        console.log('Checking equipments bucket on component mount...');
        await ensureBucketPermissions('equipments');
      }
    };
    
    setupStorage();
  }, [user]);

  const form = useForm<EquipmentFormValues>({
    resolver: zodResolver(equipmentFormSchema),
    defaultValues: {
      name: '',
      category: '',
      location: '',
      serialNumber: '',
      manufacturer: '',
      model: '',
      purchaseDate: '',
      warrantyExpiry: '',
      notes: '',
      status: 'operational',
      siteId: '',
    },
  });

  const handleSubmit = async (data: EquipmentFormValues) => {
    if (!user) {
      toast.error("You must be logged in to add equipment");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('Form submitted with file uploads:', uploadedFiles);
      
      if (uploadedFiles.length > 0) {
        console.log('Uploads found:', uploadedFiles.length, 'files');
        
        // Validate that all uploads have valid URLs
        const allUploadsValid = uploadedFiles.every(file => file.url && file.path);
        if (!allUploadsValid) {
          console.error('Some uploads missing URL or path:', uploadedFiles);
          toast.error('One or more file uploads are invalid');
          setIsSubmitting(false);
          return;
        }
      }
      
      // Prepare the data for Supabase
      const equipmentData = {
        name: data.name,
        category: data.category,
        location: data.location,
        serial_number: data.serialNumber || null,
        manufacturer: data.manufacturer || null,
        model: data.model || null,
        purchase_date: data.purchaseDate ? new Date(data.purchaseDate).toISOString() : null,
        warranty_expiry: data.warrantyExpiry ? new Date(data.warrantyExpiry).toISOString() : null,
        notes: data.notes || null,
        status: data.status,
        owner_id: user.id,
        site_id: data.siteId,
        attachments: uploadedFiles.length > 0 ? JSON.stringify(uploadedFiles.map(file => ({
          name: file.name,
          url: file.url,
          path: file.path,
          type: file.type,
          size: file.size
        }))) : null
      };
      
      console.log('Equipment data being submitted:', equipmentData);
      
      // Insert into Supabase
      const { data: savedEquipment, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error saving equipment:', error);
        toast.error("Failed to save equipment: " + error.message);
        return;
      }
      
      console.log('Equipment saved successfully with ID:', savedEquipment?.id);
      toast.success(`Equipment "${data.name}" has been added successfully`);
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave(data);
      }
      
      // Reset the form and uploaded files
      form.reset();
      setUploadedFiles([]);
      
      // Close the form
      onClose();
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast.error(`Error adding equipment: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    uploadedFiles,
    setUploadedFiles,
    isUploading,
    setIsUploading,
    handleSubmit: form.handleSubmit(handleSubmit),
  };
};
