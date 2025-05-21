import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Site } from '@/types/site';

interface Job {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority?: string;
  service_type: string;
  location_details?: string;
  schedule_notes?: string;
  assignment_notes?: string;
  due_date?: string;
  site_id?: string;
  start_time?: string | null;
  completion_time?: string | null;
  time_spent?: number | null;
  [key: string]: any;
}

export const useJobDetails = (providedJobId?: string) => {
  const [job, setJob] = useState<Job | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);
  const { jobId: urlJobId } = useParams<{ jobId: string }>();
  
  // Use the provided jobId if it exists, otherwise use the URL param
  const jobId = providedJobId || urlJobId;

  useEffect(() => {
    const fetchJobDetails = async () => {
      if (!jobId) return;
      
      try {
        setLoading(true);
        
        // Fetch job data
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select('*')
          .eq('id', jobId)
          .single();
        
        if (jobError) {
          console.error('Error fetching job details:', jobError);
          toast.error('Failed to load job details');
          setLoading(false);
          return;
        }
        
        if (!jobData) {
          toast.error('Job not found');
          setLoading(false);
          return;
        }
        
        // Set the job data
        setJob(jobData);
        
        // If we have a site_id, fetch the site data
        if (jobData.site_id) {
          console.log('Fetching site with ID:', jobData.site_id);
          
          const { data: sitesData, error: siteError } = await supabase
            .from('business_sites')
            .select('*')
            .eq('id', jobData.site_id);
            
          if (siteError) {
            console.error('Error fetching site details:', siteError);
            toast.error('Failed to load site details');
          } else if (sitesData && sitesData.length > 0) {
            console.log('Site data found:', sitesData[0]);
            setSite(sitesData[0]);
          } else {
            console.log('No site found with ID:', jobData.site_id);
          }
        } else {
          console.log('No site_id in job data');
        }
      } catch (error) {
        console.error('Error in fetchJobDetails:', error);
        toast.error('An error occurred while fetching job details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobDetails();
  }, [jobId]);
  
  return { job, site, loading };
};
