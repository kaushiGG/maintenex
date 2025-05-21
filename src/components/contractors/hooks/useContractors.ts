
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Contractor } from '@/types/contractor';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export const useContractors = () => {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  const mapContractorData = (contractor: any): Contractor => {
    return {
      id: contractor.id || '',
      name: contractor.name || '',
      serviceType: contractor.serviceType || contractor.service_type || '',
      service_type: contractor.service_type || contractor.serviceType || '', 
      credentials: contractor.credentials || '',
      status: contractor.status || 'Active',
      contactEmail: contractor.contactEmail || contractor.contact_email || '',
      contactPhone: contractor.contactPhone || contractor.contact_phone || '',
      contact_email: contractor.contact_email || contractor.contactEmail || '',
      contact_phone: contractor.contact_phone || contractor.contactPhone || '',
      location: contractor.location || 'Not specified',
      rating: contractor.rating || 0,
      notes: contractor.notes || '',
      auth_id: contractor.auth_id || null,
      email: contractor.email || '',
      company: contractor.company || '',
      phone: contractor.phone || '',
    };
  };

  const fetchContractors = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractors')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      const mappedContractors = data.map(mapContractorData);
      setContractors(mappedContractors);
      return mappedContractors;
    } catch (error) {
      console.error('Error fetching contractors:', error);
      setError('Failed to load contractors. Please try again later.');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  const findUserByEmail = async (email: string) => {
    if (!email) return null;
    
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.toLowerCase());
      
      if (!profileError && profileData && profileData.length > 0) {
        console.log('Found profile by email:', email, profileData[0].id);
        return profileData[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  };

  const addContractor = async (newContractor: Omit<Contractor, 'id'>): Promise<boolean> => {
    try {
      if (!user) {
        toast.error('You must be logged in to add contractors');
        return false;
      }
      
      // Try to find an existing user with the provided email
      let auth_id = null;
      if (newContractor.contactEmail || newContractor.contact_email) {
        const email = newContractor.contactEmail || newContractor.contact_email;
        const userId = await findUserByEmail(email);
        if (userId) {
          auth_id = userId;
          console.log(`Found user with ID ${userId} for email ${email}`);
        } else {
          console.log(`No user found for email ${email}`);
        }
      }
      
      const contractorId = uuidv4();
      
      // Make sure both snake_case and camelCase fields are set
      const insertData = {
        id: contractorId,
        name: newContractor.name,
        service_type: newContractor.serviceType || newContractor.service_type || 'General',
        credentials: newContractor.credentials || '',
        status: newContractor.status || 'Active',
        contact_email: newContractor.contactEmail || newContractor.contact_email || '',
        contact_phone: newContractor.contactPhone || newContractor.contact_phone || '',
        location: newContractor.location || 'Not specified',
        notes: newContractor.notes || '',
        rating: newContractor.rating || 0,
        owner_id: user.id,
        auth_id: auth_id
      };
      
      console.log('Inserting contractor data:', insertData);
      
      const { error } = await supabase
        .from('contractors')
        .insert(insertData);

      if (error) {
        console.error('Supabase error:', error);
        toast.error(`Failed to add contractor: ${error.message}`);
        return false;
      }

      // Add the newly created contractor to state
      const addedContractor: Contractor = {
        id: contractorId,
        name: newContractor.name,
        serviceType: newContractor.serviceType || '',
        service_type: newContractor.serviceType || newContractor.service_type || 'General',
        credentials: newContractor.credentials || '',
        status: newContractor.status || 'Active',
        contactEmail: newContractor.contactEmail || '',
        contactPhone: newContractor.contactPhone || '',
        contact_email: newContractor.contactEmail || newContractor.contact_email || '',
        contact_phone: newContractor.contactPhone || newContractor.contact_phone || '',
        location: newContractor.location || 'Not specified',
        rating: newContractor.rating || 0,
        notes: newContractor.notes || '',
        auth_id: auth_id,
        company: newContractor.company || '',
        phone: newContractor.phone || '',
        email: newContractor.email || newContractor.contact_email || '',
      };

      setContractors([addedContractor, ...contractors]);
      toast.success('Contractor added successfully');
      return true;
    } catch (error: any) {
      console.error('Error adding contractor:', error);
      toast.error('Failed to add contractor: ' + (error.message || 'Unknown error'));
      return false;
    }
  };

  const refreshContractors = () => {
    fetchContractors();
  };

  useEffect(() => {
    fetchContractors();
  }, [user]);

  return { contractors, isLoading, addContractor, refreshContractors, error };
};
