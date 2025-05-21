import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useJobActions = () => {
  const navigate = useNavigate();
  
  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/details/${jobId}`);
  };
  
  const handleStartJob = async (job: any) => {
    // Consolidated service route mapping
    const serviceRouteMap: Record<string, string> = {
      'Test & Tag': 'test-a-tag',
      'RCD Testing': 'rcd-testing',
      'Emergency Exit Lighting': 'emergency-exit-lighting',
      'Thermal Imaging': 'thermal-imaging',
      'Plumbing': 'plumbing',
      'Air Conditioning': 'air-conditioning',
      'Safety Checks': 'safety-checks',
      
      // Normalized variations
      'test_&_tag': 'test-a-tag',
      'rcd_testing': 'rcd-testing',
      'emergency_exit_lighting': 'emergency-exit-lighting',
      'thermal_imaging': 'thermal-imaging',
      'plumbing': 'plumbing',
      'air_conditioning': 'air-conditioning',
      'safety_checks': 'safety-checks',
      
      // Kebab-case and other variations
      'test-a-tag': 'test-a-tag',
      'test-tag': 'test-a-tag',
      'Testing Tags': 'test-a-tag',
      'Test a Tag': 'test-a-tag',
      'Test and Tag': 'test-a-tag',
      'test and tag': 'test-a-tag',
      'rcd-testing': 'rcd-testing',
      'emergency-exit-lighting': 'emergency-exit-lighting',
      'thermal-imaging': 'thermal-imaging',
      'air-conditioning': 'air-conditioning',
      'safety-checks': 'safety-checks'
    };
    
    let serviceType = job.service_type;
    if (!serviceType) {
      console.error('No service type found for job:', job);
      toast.error('No service type found for this job');
      return;
    }
    
    // Normalize the service type
    serviceType = serviceType.trim();
    const serviceRoute = serviceRouteMap[serviceType] || '';
    
    if (serviceRoute) {
      try {
      // Update job status to in-progress if it's accepted
      if (job.status?.toLowerCase() === 'accepted') {
        // This will automatically record the start_time in the database
          await updateJobStatus(job.id, 'in-progress');
        }
        
        // For test-tag, thermal-imaging, and safety-checks, fetch additional details before navigating
        if (serviceRoute === 'test-a-tag' || serviceRoute === 'thermal-imaging' || serviceRoute === 'safety-checks') {
          // Get complete job details with site information
          const { data: jobDetails, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              business_sites:site_id (
                id,
                name,
                address,
                description,
                type,
                location,
                contact_name,
                contact_phone,
                contact_email,
                notes
              ),
              clients (
                id, 
                name,
                business_name,
                phone,
                email
              ),
              equipment_count:equipment(count)
            `)
            .eq('id', job.id)
            .single();
            
          if (jobError) {
            console.error('Error fetching job details:', jobError);
            // Don't show error toast since we can proceed with basic information
            console.log('Proceeding with basic job information...');
            
            // For thermal imaging jobs
            if (serviceRoute === 'thermal-imaging') {
              navigate(`/services/thermal-imaging?jobId=${job.id}&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || job.sites?.name || 'Unknown')}&siteAddress=${encodeURIComponent(job.business_sites?.address || job.sites?.address || '')}`);
            } 
            // For test and tag jobs
            else if (serviceRoute === 'test-a-tag') {
              navigate(`/services/test-tag?siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || job.sites?.name || 'Unknown')}&jobId=${job.id}`);
            }
            // For safety checks jobs
            else if (serviceRoute === 'safety-checks') {
              navigate(`/services/safety-checks?tab=dashboard&jobId=${job.id}&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || job.sites?.name || 'Unknown')}`);
            }
            // For other services
            else {
              navigate(`/services/landing/${serviceRoute}?jobId=${job.id}&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || job.sites?.name || 'Unknown')}`);
            }
            return;
          } else if (jobDetails) {
            // For thermal imaging jobs
            if (serviceRoute === 'thermal-imaging') {
              navigate(`/services/thermal-imaging?jobId=${jobDetails.id}&siteId=${jobDetails.site_id || 'unknown'}&siteName=${encodeURIComponent(jobDetails.business_sites?.name || 'Unknown')}&siteAddress=${encodeURIComponent(jobDetails.business_sites?.address || '')}`);
            } 
            // For safety checks jobs
            else if (serviceRoute === 'safety-checks') {
              const queryParams = new URLSearchParams({
                tab: 'dashboard',
                jobId: jobDetails.id,
                siteId: jobDetails.site_id || 'unknown',
                siteName: jobDetails.business_sites?.name || 'Unknown',
                siteAddress: jobDetails.business_sites?.address || ''
              });
              
              if (jobDetails.business_sites?.description) {
                queryParams.append('siteDescription', jobDetails.business_sites.description);
              }
              
              if (jobDetails.description) {
                queryParams.append('jobDescription', jobDetails.description);
              }
              
              navigate(`/services/safety-checks?${queryParams.toString()}`);
            }
            // For test and tag jobs, directly load the test and tag component with complete data
            else if (serviceRoute === 'test-a-tag') {
              const queryParams = new URLSearchParams({
                jobId: jobDetails.id,
                siteId: jobDetails.site_id || 'unknown',
                siteName: jobDetails.business_sites?.name || 'Unknown',
                clientName: jobDetails.clients?.[0]?.business_name || jobDetails.clients?.[0]?.name || 'Unknown Client',
                siteAddress: jobDetails.business_sites?.address || ''
              });
              
              if (jobDetails.business_sites?.description) {
                queryParams.append('siteDescription', jobDetails.business_sites.description);
              }
              
              if (jobDetails.business_sites?.type) {
                queryParams.append('siteType', jobDetails.business_sites.type);
              }
              
              if (jobDetails.description) {
                queryParams.append('jobDescription', jobDetails.description);
              }
              
              // Add assignment notes if available
              if (jobDetails.notes) {
                queryParams.append('assignmentNotes', jobDetails.notes);
              }
              
              // Add contact information if available
              if (jobDetails.business_sites?.contact_name) {
                queryParams.append('siteContactName', jobDetails.business_sites.contact_name);
              }
              
              if (jobDetails.business_sites?.contact_phone) {
                queryParams.append('siteContactPhone', jobDetails.business_sites.contact_phone);
              }
              
              if (jobDetails.business_sites?.contact_email) {
                queryParams.append('siteContactEmail', jobDetails.business_sites.contact_email);
              }
              
              // Add client contact information
              if (jobDetails.clients?.[0]?.phone) {
                queryParams.append('clientPhone', jobDetails.clients[0].phone);
              }
              
              if (jobDetails.clients?.[0]?.email) {
                queryParams.append('clientEmail', jobDetails.clients[0].email);
              }
              
              // Add site notes if available
              if (jobDetails.business_sites?.notes) {
                queryParams.append('siteNotes', jobDetails.business_sites.notes);
              }
              
              navigate(`/services/test-tag?${queryParams.toString()}`);
            }
            return;
          }
        }
        
        // For other service types or if detailed fetch fails, fall back to basic navigation
        // Load UI based on job service type
        if (serviceRoute === 'thermal-imaging') {
          navigate(`/services/thermal-imaging?siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&siteAddress=${encodeURIComponent(job.business_sites?.address || '')}&jobId=${job.id}`);
        } 
        // For test and tag jobs, directly load the test and tag component
        else if (serviceRoute === 'test-a-tag') {
          navigate(`/services/test-tag?siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&jobId=${job.id}`);
        }
        // For safety checks jobs
        else if (serviceRoute === 'safety-checks') {
          navigate(`/services/safety-checks?tab=dashboard&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&jobId=${job.id}`);
        }
        // For other service types, fall back to the landing page
        else {
          navigate(`/services/landing/${serviceRoute}?jobId=${job.id}&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}`);
        }
      } catch (err) {
        console.error('Error in handleStartJob:', err);
        toast.error('An error occurred while starting the job');
        
        // Fallback navigation with basic parameters
      if (serviceRoute === 'thermal-imaging') {
          navigate(`/services/thermal-imaging?siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&jobId=${job.id}`);
        } else if (serviceRoute === 'test-a-tag') {
          navigate(`/services/test-tag?siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&jobId=${job.id}`);
        } else if (serviceRoute === 'safety-checks') {
          navigate(`/services/safety-checks?tab=dashboard&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}&jobId=${job.id}`);
      } else {
          navigate(`/services/landing/${serviceRoute}?jobId=${job.id}&siteId=${job.site_id || 'unknown'}&siteName=${encodeURIComponent(job.business_sites?.name || 'Unknown')}`);
        }
      }
    } else {
      console.error(`Unknown service type: "${serviceType}"`);
      toast.error(`Unknown service type: ${serviceType}`);
    }
  };

  const handleCompleteJob = async (job: any) => {
    try {
      if (job.status?.toLowerCase() === 'in-progress') {
        console.log('Completing job with ID:', job.id);
        
        // This will automatically record the completion_time and calculate time_spent
        const result = await updateJobStatus(job.id, 'completed');
        
        if (result) {
          // Update UI to show job as completed
          job.status = 'completed';
          
          console.log('Job completed successfully');
          toast.success('Job completed successfully!');
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Error in handleCompleteJob:', err);
      toast.error('An error occurred while completing the job');
      return false;
    }
  };

  const handleViewReport = async (job: any) => {
    try {
      if (!job || !job.id) {
        console.error('Invalid job object:', job);
        toast.error('Cannot view report: Invalid job data');
        return;
      }
      
      const serviceType = job.service_type?.toLowerCase() || '';
      console.log(`Attempting to view report for job ID: ${job.id}, service type: ${serviceType}`);
      
      // Handle different service types and their respective tables
      if (serviceType.includes('thermal')) {
        // For thermal imaging jobs
        console.log('Fetching thermal imaging report from thermal_imaging_reports table');
        const { data: reportData, error: reportError } = await supabase
          .from('thermal_imaging_reports')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (reportError) {
          console.error('Error fetching thermal imaging report:', reportError);
          
          if (reportError.code === 'PGRST116') {
            toast.error('No thermal imaging report found for this job');
          } else {
            toast.error(`Failed to retrieve report data: ${reportError.message}`);
          }
          return;
        }
        
        if (reportData) {
          console.log('Report found, navigating to report view page', reportData);
          // Navigate to report view page with type parameter
          navigate(`/jobs/report/${job.id}?type=thermal-imaging&reportId=${reportData.id}`);
        } else {
          toast.error('No report found for this job');
        }
      } else if (serviceType.includes('test') && serviceType.includes('tag')) {
        // For Test & Tag reports
        console.log('Fetching test & tag report from test_and_tag_reports table');
        const { data: reportData, error: reportError } = await supabase
          .from('test_and_tag_reports')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (reportError) {
          console.error('Error fetching test & tag report:', reportError);
          
          if (reportError.code === 'PGRST116') {
            toast.error('No test & tag report found for this job');
          } else {
            toast.error(`Failed to retrieve report data: ${reportError.message}`);
          }
          return;
        }
        
        if (reportData) {
          console.log('Report found, navigating to report view page', reportData);
          navigate(`/jobs/report/${job.id}?type=test-and-tag&reportId=${reportData.id}`);
        } else {
          toast.error('No report found for this job');
        }
      } else if (serviceType.includes('rcd')) {
        // For RCD Testing reports
        console.log('Fetching RCD testing report from rcd_testing_reports table');
        const { data: reportData, error: reportError } = await supabase
          .from('rcd_testing_reports')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (reportError) {
          console.error('Error fetching RCD testing report:', reportError);
          
          if (reportError.code === 'PGRST116') {
            toast.error('No RCD testing report found for this job');
          } else {
            toast.error(`Failed to retrieve report data: ${reportError.message}`);
          }
          return;
        }
        
        if (reportData) {
          console.log('Report found, navigating to report view page', reportData);
          navigate(`/jobs/report/${job.id}?type=rcd-testing&reportId=${reportData.id}`);
        } else {
          toast.error('No report found for this job');
        }
      } else if (serviceType.includes('emergency') || serviceType.includes('exit') || serviceType.includes('light')) {
        // For Emergency Exit Lighting reports
        console.log('Fetching emergency lighting report from emergency_lighting_reports table');
        const { data: reportData, error: reportError } = await supabase
          .from('emergency_lighting_reports')
          .select('*')
          .eq('job_id', job.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (reportError) {
          console.error('Error fetching emergency lighting report:', reportError);
          
          if (reportError.code === 'PGRST116') {
            toast.error('No emergency lighting report found for this job');
          } else {
            toast.error(`Failed to retrieve report data: ${reportError.message}`);
          }
          return;
        }
        
        if (reportData) {
          console.log('Report found, navigating to report view page', reportData);
          navigate(`/jobs/report/${job.id}?type=emergency-lighting&reportId=${reportData.id}`);
        } else {
          toast.error('No report found for this job');
        }
      } else {
        // For other service types or generic reports
        console.log(`Reports for service type "${job.service_type}" are not yet implemented`);
        toast.info(`Reports for ${job.service_type} are not yet implemented`);
      }
    } catch (err) {
      console.error('Error in handleViewReport:', err);
      toast.error('An error occurred while retrieving the report');
    }
  };

  const handleAcceptJob = async (job: any) => {
    try {
      if (job.status?.toLowerCase() === 'pending') {
        console.log('Accepting job with ID:', job.id);
        
        // Instead of calling accept_job, directly update the status to 'in-progress'
        const result = await updateJobStatus(job.id, 'in-progress');
        
        if (!result) {
          console.error('Error setting job to in-progress');
          toast.error(`Failed to accept job and set to in-progress`);
          return false;
        }
        
        // Update UI to show job as in-progress
        job.status = 'in-progress';
        
        console.log('Job accepted and set to in-progress successfully');
        toast.success('Job accepted and started successfully!');
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error in handleAcceptJob:', err);
      toast.error('An error occurred while accepting the job');
      return false;
    }
  };
  
  const updateJobStatus = async (jobId: string, status: string) => {
    try {
      console.log(`Updating job ${jobId} status to: ${status}`);
      
      // Use a direct RPC call instead of a table update to avoid RLS recursion
      // This function will handle recording start_time, completion_time, and time_spent
      const { data, error } = await supabase.rpc('update_job_status', { 
        job_id: jobId, 
        new_status: status 
      });
        
      if (error) {
        console.error('Error updating job status:', error);
        toast.error(`Failed to update job status: ${error.message}`);
        return false;
      }
      
      console.log('Job status updated successfully');
      return true;
    } catch (err) {
      console.error('Error in updateJobStatus:', err);
      toast.error('An error occurred while updating the job status');
      return false;
    }
  };
  
  return { 
    handleViewDetails,
    handleStartJob,
    handleCompleteJob,
    handleViewReport,
    handleAcceptJob,
    updateJobStatus
  };
};
