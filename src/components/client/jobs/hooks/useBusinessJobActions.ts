import { useNavigate } from 'react-router-dom';
import { useJobActions } from '@/components/contractor/jobs/hooks/useJobActions';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const useBusinessJobActions = () => {
  const navigate = useNavigate();
  const jobActions = useJobActions();
  
  // Override the handleViewDetails function to navigate to the business provider job details route
  const handleViewDetails = (jobId: string) => {
    // Add a debug console.log to see when this is called
    console.log('BUSINESS JOB ACTIONS: Navigating to business provider job details', { jobId });
    
    // Force direct navigation to our business route
    navigate(`/business/provider/jobs/${jobId}`);
    
    // Display a toast for debugging
    toast.info('Opening job details in provider mode');
  };
  
  // Add method to update job status with improved debugging
  const updateJobStatus = async (jobId: string, status: string) => {
    console.log(`Updating job ${jobId} status to ${status}`);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .update({ status })
        .eq('id', jobId)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating job status:', error);
        toast.error('Failed to update job status');
        return false;
      }
      
      console.log('Job status updated successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in updateJobStatus:', error);
      return false;
    }
  };
  
  // Add a method for starting a thermal imaging service specifically
  const startThermalImagingService = (jobId?: string) => {
    console.log('Starting thermal imaging service', { jobId });
    toast.success('Navigating to Thermal Imaging service');
    navigate('/services/thermal-imaging');
  };
  
  // Add a generic method to start a service based on service type
  const startService = (serviceType: string, jobId?: string) => {
    console.log(`Starting ${serviceType} service`, { jobId });
    
    let serviceRoute = '';
    switch (serviceType?.toLowerCase()) {
      case 'thermal imaging':
      case 'thermal-imaging':
        serviceRoute = '/services/thermal-imaging';
        break;
      case 'test and tag':
      case 'test-tag':
        serviceRoute = '/services/test-tag';
        break;
      case 'rcd testing':
      case 'rcd-testing':
        serviceRoute = '/services/rcd-testing';
        break;
      case 'emergency exit lighting':
      case 'emergency-exit-lighting':
        serviceRoute = '/services/emergency-exit-lighting';
        break;
      case 'plumbing':
        serviceRoute = '/services/plumbing';
        break;
      case 'air conditioning':
      case 'air-conditioning':
        serviceRoute = '/services/air-conditioning';
        break;
      case 'safety checks':
      case 'safety-checks':
        serviceRoute = '/services/safety-checks';
        break;
      default:
        toast.error(`No service UI available for ${serviceType}`);
        return;
    }
    
    if (serviceRoute) {
      toast.success(`Navigating to ${serviceType} service`);
      navigate(serviceRoute);
    }
  };
  
  // Return all the original job actions but override handleViewDetails
  return {
    ...jobActions,
    handleViewDetails,
    updateJobStatus,
    startThermalImagingService,
    startService
  };
}; 