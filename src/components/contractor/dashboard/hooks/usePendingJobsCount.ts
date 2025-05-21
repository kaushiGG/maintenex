import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const usePendingJobsCount = () => {
  const { user } = useAuth();
  const [pendingJobsCount, setPendingJobsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPendingJobsCount = async () => {
      if (!user) {
        console.log('No user found, cannot fetch pending jobs count');
        setLoading(false);
        return;
      }
      
      try {
        // First, get the contractor record for this user
        const { data: contractorData, error: contractorError } = await supabase
          .from('contractors')
          .select('id, name, contact_email')
          .eq('auth_id', user.id)
          .single();
        
        if (contractorError) {
          console.error('Error fetching contractor data:', contractorError);
          setLoading(false);
          return;
        }
        
        if (!contractorData?.id) {
          console.error('No contractor record found for auth_id:', user.id);
          setLoading(false);
          return;
        }

        // Use a single query with OR conditions to get all pending jobs for this contractor
        // This prevents double-counting jobs that match both conditions
        const { count, error: jobsError } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'pending')
          .or(`contractor_id.eq.${contractorData.id},assigned_to.eq.${contractorData.name},assigned_to.eq.${contractorData.contact_email}`);

        if (jobsError) {
          console.error('Error fetching jobs count:', jobsError);
          setLoading(false);
          return;
        }

        setPendingJobsCount(count || 0);
        console.log('Pending jobs count:', count);
      } catch (error) {
        console.error('Error in pending jobs count fetching process:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingJobsCount();
  }, [user]);

  return { pendingJobsCount, loading };
}; 