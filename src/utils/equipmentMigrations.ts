import { supabase } from '@/integrations/supabase/client';

// Add safety checks columns to equipment table
export const addSafetyChecksToEquipment = async () => {
  try {
    // Create equipment-videos bucket
    const bucketCreated = await createEquipmentVideosBucket();
    if (!bucketCreated) {
      console.error('Failed to create equipment-videos bucket');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in addSafetyChecksToEquipment:', error);
    return false;
  }
};

// Create storage bucket for equipment training videos
export const createEquipmentVideosBucket = async () => {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const bucketExists = buckets.some(bucket => bucket.name === 'equipment-videos');

    if (!bucketExists) {
      // Create bucket if it doesn't exist
      const { error: createError } = await supabase
        .storage
        .createBucket('equipment-videos', {
          public: true,
          fileSizeLimit: 52428800 // 50MB in bytes
        });

      if (createError) {
        console.error('Error creating equipment-videos bucket:', createError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in createEquipmentVideosBucket:', error);
    return false;
  }
}; 