import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Profile {
  firstName: string;
  lastName: string;
  email: string;
}

export const useJobsData = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { user } = useAuth();

  // Debug function to check database connection and permissions
  const debugCheckDatabase = async () => {
    console.log('DEBUG: Checking database connection and permissions...');
    
    // 1. Check if we can read from profiles table (which we know works)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
      
    console.log('DEBUG: Profiles table access:', {
      success: !profileError,
      error: profileError?.message,
      hasData: !!profileData
    });

    // 2. Check if we can read from jobs table without any filters
    const { data: jobsData, error: jobsError } = await supabase
      .from('jobs')
      .select('count')
      .limit(1);
      
    console.log('DEBUG: Jobs table access:', {
      success: !jobsError,
      error: jobsError?.message,
      hasData: !!jobsData
    });
  };

  // Debug function to check all jobs
  const debugCheckAllJobs = async (contractorId: string) => {
    console.log('DEBUG: Checking all jobs in database...');
    console.log('DEBUG: Current user ID:', user?.id);
    console.log('DEBUG: Contractor ID:', contractorId);
    
    // First check database connection
    await debugCheckDatabase();
    
    // Try a simple query first
    const { data: simpleJobsData, error: simpleJobsError } = await supabase
      .from('jobs')
      .select('id, title, contractor_id, assigned_to')
      .limit(10);
    
    console.log('DEBUG: Simple jobs query result:', {
      success: !simpleJobsError,
      error: simpleJobsError?.message,
      data: simpleJobsData
    });

    const { data: allJobs, error: allJobsError } = await supabase
      .from('jobs')
      .select('*');
    
    if (allJobsError) {
      console.error('DEBUG: Error fetching all jobs:', allJobsError);
      return;
    }

    console.log('DEBUG: All jobs in database:', allJobs);
    
    // Check for jobs matching our contractor
    const matchingJobs = allJobs.filter(job => 
      job.contractor_id === contractorId || 
      job.assigned_to === 'Oracle' ||
      job.assigned_to === 'damayanthijay59@gmail.com'
    );
    
    console.log('DEBUG: Jobs matching our contractor:', matchingJobs);

    // Try explicit queries for each condition
    const { data: contractorIdJobs } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('contractor_id', contractorId);
    
    console.log('DEBUG: Jobs by contractor_id:', contractorIdJobs);

    const { data: assignedNameJobs } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('assigned_to', 'Oracle');
    
    console.log('DEBUG: Jobs by assigned_to (name):', assignedNameJobs);

    const { data: assignedEmailJobs } = await supabase
      .from('jobs')
      .select('id, title')
      .eq('assigned_to', 'damayanthijay59@gmail.com');
    
    console.log('DEBUG: Jobs by assigned_to (email):', assignedEmailJobs);
  };

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        // First try to get profile from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile from profiles table:', error);
          // Try to get user data from auth.users if available
          try {
            // Set default profile from user object as fallback
            setProfile({
              firstName: user.user_metadata?.first_name || '',
              lastName: user.user_metadata?.last_name || '',
              email: user.email || ''
            });
          } catch (err) {
            console.error('Error creating fallback profile:', err);
          }
          return;
        }
        
        if (data) {
          setProfile({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || ''
          });
        }
      } catch (error) {
        console.error('Error in fetchProfile:', error);
        // Don't show toast error here, just log it
      }
    };
    
    fetchProfile();
  }, [user]);

  // Fetch jobs for the logged-in contractor
  useEffect(() => {
    const fetchJobs = async () => {
      if (!user) {
        console.log('No user found in useJobsData');
        setLoading(false);
        return;
      }
      
      console.log('DEBUG: Starting job fetch for user:', user.id);
      setLoading(true);
      
      try {
        // First, get the contractor record for this user
        console.log('DEBUG: Fetching contractor data for auth_id:', user.id);
        const { data: contractorData, error: contractorError } = await supabase
          .from('contractors')
          .select('id, name, contact_email')
          .eq('auth_id', user.id)
          .single();
        
        if (contractorError) {
          console.error('DEBUG: Error fetching contractor data:', contractorError);
          // Instead of showing error toast, log it and continue with empty jobs
          console.log('Using fallback: empty jobs list');
          setJobs([]);
          setLoading(false);
          return;
        }
        
        if (!contractorData?.id) {
          console.error('DEBUG: No contractor record found for auth_id:', user.id);
          // Create a helpful message instead of error
          toast.info('Please complete your contractor profile setup');
          setJobs([]);
          setLoading(false);
          return;
        }
        
        console.log('DEBUG: Found contractor data:', {
          id: contractorData.id,
          name: contractorData.name,
          email: contractorData.contact_email
        });

        // Debug: Check all jobs first
        await debugCheckAllJobs(contractorData.id);
        
        // Fetch jobs assigned to this contractor by either contractor_id or assigned_to
        console.log('DEBUG: Fetching jobs by contractor_id:', contractorData.id);
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(name, address)
          `)
          .in('contractor_id', [contractorData.id])
          .order('created_at', { ascending: false });

        if (jobsError) {
          console.error('DEBUG: Error fetching jobs by contractor_id:', jobsError);
          toast.error('Failed to load assigned jobs');
          setLoading(false);
          return;
        }
        
        console.log('DEBUG: Jobs fetched by contractor_id:', jobsData || []);
        if (jobsData && jobsData.length > 0) {
          console.log('DEBUG: Found jobs by contractor_id, setting jobs');
          setJobs(jobsData);
        } else {
          console.log('DEBUG: No jobs found by contractor_id, trying assigned_to with:', [contractorData.name, contractorData.contact_email]);
          
          // Try finding jobs by assigned_to field
          const { data: assignedJobsData, error: assignedJobsError } = await supabase
            .from('jobs')
            .select(`
              *,
              sites:site_id(name, address)
            `)
            .in('assigned_to', [contractorData.name, contractorData.contact_email])
            .order('created_at', { ascending: false });
            
          if (assignedJobsError) {
            console.error('DEBUG: Error fetching jobs by assigned_to:', assignedJobsError);
          } else if (assignedJobsData && assignedJobsData.length > 0) {
            console.log('DEBUG: Found jobs by assigned_to:', assignedJobsData);
            setJobs(assignedJobsData);
          } else {
            console.log('DEBUG: No jobs found for contractor by either method');
            setJobs([]);
          }
        }
      } catch (error) {
        console.error('DEBUG: Error in job fetching process:', error);
        // Set empty jobs instead of showing error
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [user]);

  return { jobs, loading, profile };
};
