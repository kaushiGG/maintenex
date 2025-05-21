import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: 'contractor' | 'business' | 'employee';
  is_approved: boolean;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  postcode?: string;
  abn?: string;
  website?: string;
  vehicle?: string;
  bio?: string;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        console.log('Loading profile for user:', user.id);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          
          // If profile doesn't exist, create one
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating new profile');
            
            // Get user type from metadata
            const userType = user.user_metadata?.userType || 'contractor';
            const isApproved = userType === 'business' ? true : false;
            
            const newProfile = {
              id: user.id,
              email: user.email || '',
              first_name: user.user_metadata?.firstName || '',
              last_name: user.user_metadata?.lastName || '',
              user_type: userType,
              is_approved: isApproved,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            console.log('Creating profile with data:', newProfile);
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from('profiles')
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }
            
            console.log('Created new profile:', insertedProfile);
            setProfile(insertedProfile);
            setLoading(false);
            return;
          }
          
          throw error;
        }

        console.log('Profile loaded:', data);
        setProfile(data);
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  return { profile, loading };
} 