import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

export interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  is_approved?: boolean;
  approval_date?: string;
  user_type?: string;
}

export interface SkillData {
  skills: string[];
}

export interface CertificationData {
  id?: string;
  name: string;
  issuer: string;
  date: string; 
  expiry: string;
}

export const getProfileData = async (): Promise<ProfileData | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // First, check if the profiles table exists and has the expected structure
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);

    if (tableError) {
      console.error('Error checking profiles table:', tableError);
      throw new Error('Failed to access profiles table');
    }

    // Get the user's profile data
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }

    // If no profile exists yet, create one with default values
    if (!data) {
      console.log('No profile found, creating default profile');
      // Get the user type from metadata, defaulting to 'contractor' if not found
      const userType = user.user_metadata?.userType || 'contractor';
      
      const defaultProfile = {
        id: user.id,
        email: user.email || '',
        first_name: user.user_metadata?.firstName || '',
        last_name: user.user_metadata?.lastName || '',
        phone: '',
        user_type: userType,
        is_approved: userType === 'business' ? true : false, // Business users are auto-approved
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating profile with data:', defaultProfile);

      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (insertError) {
        console.error('Error creating default profile:', insertError);
        throw insertError;
      }

      console.log('Created new profile:', newProfile);

      // Create a contractor record if user_type is contractor
      if (defaultProfile.user_type === 'contractor') {
        const contractorId = uuidv4();
        const { error: contractorError } = await supabase
          .from('contractors')
          .insert({
            id: contractorId,
            name: `${defaultProfile.first_name} ${defaultProfile.last_name}`.trim(),
            contact_email: defaultProfile.email,
            auth_id: user.id,
            owner_id: user.id,
            service_type: 'general', // Added required service_type field
            status: 'Active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (contractorError) {
          console.error('Error creating contractor record:', contractorError);
          toast.error('Failed to create contractor profile');
        } else {
          console.log('Created contractor record with ID:', contractorId);
        }
      }

      // Return the newly created profile
      return {
        firstName: newProfile.first_name || '',
        lastName: newProfile.last_name || '',
        email: user.email || '',
        phone: newProfile.phone || '',
        company: '',
        is_approved: newProfile.is_approved || false,
        approval_date: newProfile.approval_date || '',
        user_type: newProfile.user_type || 'contractor'
      };
    }

    // Map the database fields to the UI fields, with fallbacks for missing fields
    // Use type assertion to handle the company field that might not exist yet
    const profileData = data as any;
    return {
      firstName: profileData.first_name || '',
      lastName: profileData.last_name || '',
      email: user.email || '',
      phone: profileData.phone || '',
      company: profileData.company || '',
      is_approved: profileData.is_approved || false,
      approval_date: profileData.approval_date || '',
      user_type: profileData.user_type || 'contractor'
    };
  } catch (error) {
    console.error('Error fetching profile data:', error);
    throw error;
  }
};

export const updateProfileData = async (profileData: ProfileData): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    // Map UI fields back to database fields
    const updateData: Record<string, any> = {
      phone: profileData.phone,
      updated_at: new Date().toISOString()
    };

    // Only include company if it exists in the database
    if (profileData.company !== undefined) {
      updateData.company = profileData.company;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    if (error) throw error;
  } catch (error) {
    console.error('Error updating profile data:', error);
    throw error;
  }
};

export const checkApprovalStatus = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user found');

    const { data, error } = await supabase
      .from('profiles')
      .select('is_approved, user_type')
      .eq('id', user.id)
      .single();

    if (error) throw error;
    
    // Business users are always approved
    if (data?.user_type === 'business') return true;
    
    // Contractors need approval
    return data?.is_approved || false;
  } catch (error) {
    console.error('Error checking approval status:', error);
    return false;
  }
};

export async function updateSkills(skills: string[]) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('Not authenticated');
    
    const { error } = await supabase
      .from('contractors')
      .update({ skills })
      .eq('auth_id', user.id);
    
    if (error) {
      console.error('Error updating skills:', error);
      throw error;
    }
    
    toast.success('Skills updated successfully');
    return true;
  } catch (error: any) {
    console.error('Error updating skills:', error);
    toast.error(error.message || 'Failed to update skills');
    return false;
  }
}

// Future implementation for certifications management
// This will need a certifications table in the database
