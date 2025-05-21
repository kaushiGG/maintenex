import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { UploadedFile } from '@/types/asset';

/**
 * Check if bucket exists and is accessible
 * @param bucketName Name of the bucket to check
 * @returns Promise that resolves when checks are complete
 */
export const ensureBucketPermissions = async (bucketName: string): Promise<boolean> => {
  try {
    console.log(`Checking bucket '${bucketName}'...`);
    
    // Try to list files in the bucket to verify access
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .list();

    if (error) {
      console.error('Error accessing bucket:', error);
      return false;
    }

    console.log(`Bucket '${bucketName}' is accessible`);
    return true;
  } catch (error) {
    console.error('Error in ensureBucketPermissions:', error);
    return false;
  }
};

/**
 * Upload a file to Supabase storage
 * @param file The file to upload
 * @param bucketName The name of the bucket to upload to
 * @param folderPath An optional folder path or userId to organize files
 * @param equipmentId An optional equipment ID to further organize files
 * @returns Promise with the uploaded file data
 */
export const uploadFile = async (
  file: File,
  bucketName: string,
  folderPath?: string,
  equipmentId?: string
): Promise<UploadedFile> => {
  try {
    // Ensure bucket exists
    await ensureBucketPermissions(bucketName);

    // Create a unique file path based on available parameters
    const fileExtension = file.name.split('.').pop();
    const timestamp = new Date().getTime();
    let filePath = '';
    
    if (equipmentId && folderPath) {
      // Both userId/folder and equipmentId provided (fully qualified path)
      filePath = `${folderPath}/${equipmentId}/${timestamp}-${file.name}`;
    } else if (folderPath) {
      // Only userId/folder provided
      filePath = `${folderPath}/${timestamp}-${file.name}`;
    } else {
      // Basic path with just timestamp
      filePath = `${timestamp}-${file.name}`;
    }

    // Upload the file
    const { error: uploadError, data } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      throw new Error('Failed to upload file');
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Create the UploadedFile object
    const uploadedFile: UploadedFile = {
      name: file.name,
      url: publicUrl,
      path: filePath,
      type: file.type,
      size: file.size,
      equipmentId: equipmentId || undefined,
      uploadedAt: new Date().toISOString()
    };

    console.log('Created UploadedFile object:', uploadedFile);

    return uploadedFile;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
};

/**
 * Delete a file from Supabase storage
 * @param filePath The path of the file to delete
 * @param bucketName The name of the bucket the file is in
 * @returns Promise with success status
 */
export const deleteFile = async (
  filePath: string,
  bucketName: string = 'equipments'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .storage
      .from(bucketName)
      .list();

    if (error) {
      console.error('Error accessing bucket:', error);
      return false;
    }

    const { error: deleteError } = await supabase
      .storage
      .from(bucketName)
      .remove([filePath]);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFile:', error);
    return false;
  }
};

/**
 * Get the public URL for a file in a bucket
 * @param bucketName The name of the bucket containing the file
 * @param filePath The path of the file within the bucket
 * @returns The public URL string or empty string if error
 */
export const getPublicFileUrl = (
  bucketName: string,
  filePath: string
): string => {
  try {
    if (!filePath) {
      console.error('No file path provided to getPublicFileUrl');
      return '';
    }

    // Make sure filePath doesn't start with a leading slash
    const cleanPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    
    console.log(`Getting public URL for ${bucketName}/${cleanPath}`);
    
    // Some paths might include the bucket name already - handle that case
    const finalPath = cleanPath.startsWith(`${bucketName}/`) 
      ? cleanPath.substring(bucketName.length + 1) 
      : cleanPath;
    
    const { data } = supabase.storage.from(bucketName).getPublicUrl(finalPath);
    
    if (!data.publicUrl) {
      console.error(`Failed to get public URL for ${bucketName}/${finalPath}`);
      return '';
    }
    
    // Log URL for debugging
    console.log(`Public URL: ${data.publicUrl}`);
    
    // Verify URL is properly formatted
    try {
      new URL(data.publicUrl);
    } catch (e) {
      console.error(`Invalid URL format: ${data.publicUrl}`);
      return '';
    }
    
    return data.publicUrl;
  } catch (error) {
    console.error(`Error getting public URL for ${bucketName}/${filePath}:`, error);
    return '';
  }
};

/**
 * Force upload a file to Supabase storage, bypassing bucket permission checks
 * Use this as a fallback when normal upload is failing due to RLS issues
 */
export const forceUploadFile = async (
  file: File,
  bucketName: string = 'documents-attach',
  folderPath: string = ''
): Promise<UploadedFile | null> => {
  try {
    console.log(`Force uploading file '${file.name}' to bucket '${bucketName}'...`);
    
    // Generate a unique filename to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '')}`;
    const filePath = folderPath ? `${folderPath}/${fileName}` : fileName;
    
    console.log(`Uploading file to path: '${filePath}'...`);
    
    // Get URL and API key from environment variables
    const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://opgqrdltnngkhjymgmmy.supabase.co';
    const apiKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wZ3FyZGx0bm5na2hqeW1nbW15Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NDY2ODcsImV4cCI6MjA1OTIyMjY4N30.K9p-IjOiYbSDBHlSLuhc7Uy1HQrReec8796x1O2FnlU';
    
    // First make sure the bucket exists
    try {
      // Import the forceConfigureStorage function dynamically
      const { forceConfigureStorage } = await import('@/utils/migrations');
      await forceConfigureStorage();
    } catch (e) {
      console.warn('Could not force configure storage:', e);
      // Continue anyway as the bucket might already be set up
    }
    
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Directly upload using the Storage API
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucketName}/${filePath}`;
    const uploadResponse = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });
    
    if (!uploadResponse.ok) {
      console.error('Force upload failed:', await uploadResponse.text());
      throw new Error(`Upload failed with status: ${uploadResponse.status}`);
    }
    
    // Get the URL for the uploaded file
    const fileUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;
    
    console.log('Force upload successful, file URL:', fileUrl);
    
    return {
      path: filePath,
      name: file.name,
      size: file.size,
      type: file.type,
      url: fileUrl
    };
  } catch (error: any) {
    console.error('Force upload failed:', error);
    toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    return null;
  }
};

/**
 * Update equipment attachments in the database
 * @param equipmentId The ID of the equipment to update
 * @param attachments The new attachments array
 * @returns Promise with success status
 */
export const updateEquipmentAttachments = async (
  equipmentId: string,
  attachments: UploadedFile[]
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('equipment')
      .update({ attachments: JSON.stringify(attachments) })
      .eq('id', equipmentId);

    if (error) {
      console.error('Error updating equipment attachments:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in updateEquipmentAttachments:', error);
    return false;
  }
};
