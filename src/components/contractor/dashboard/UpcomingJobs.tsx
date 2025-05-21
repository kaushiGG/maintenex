import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, CheckCircle, Wrench, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Define the Job interface based on the Supabase schema
interface Job {
  id: string;
  title: string;
  status: string;
  priority: string | null;
  due_date: string | null;
  description: string | null;
  service_type: string;
  site_id: string | null;
  contractor_id: string | null;
  assigned_to: string | null;
  sites: {
    name: string;
    address: string;
  } | null;
  created_at: string;
  estimatedHours?: number; // Not in schema but used for UI
}

// Priority badge component
const PriorityBadge = ({ priority }: { priority: string | null }) => {
  const priorityStyles = {
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low: 'bg-blue-100 text-blue-800',
    urgent: 'bg-red-100 text-red-800',
  };
  
  if (!priority) return null;
  
  const style = priorityStyles[priority as keyof typeof priorityStyles] || priorityStyles.medium;
  
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${style}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
};

const UpcomingJobs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    fetchJobs();
  }, [user]);
  
  const fetchJobs = async () => {
    if (!user) {
      console.log('No user found, cannot fetch jobs');
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    try {
      // First, get the contractor record for this user
      const { data: contractorData, error: contractorError } = await supabase
        .from('contractors')
        .select('id, name, contact_email')
        .eq('auth_id', user.id)
        .single();
      
      if (contractorError) {
        console.error('Error fetching contractor data:', contractorError);
        setJobs([]);
        setLoading(false);
        return;
      }
      
      if (!contractorData?.id) {
        console.error('No contractor record found for auth_id:', user.id);
        setJobs([]);
        setLoading(false);
        return;
      }
      
      // Fetch jobs assigned to this contractor with status 'pending'
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          sites:site_id(name, address)
        `)
        .eq('contractor_id', contractorData.id)
        .eq('status', 'pending')
        .order('due_date', { ascending: true });

      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        toast.error('Failed to load upcoming jobs');
        setJobs([]);
        setLoading(false);
        return;
      }
      
      // If no jobs found by contractor_id, try finding jobs by assigned_to field
      if (!jobsData || jobsData.length === 0) {
        const { data: assignedJobsData, error: assignedJobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(name, address)
          `)
          .in('assigned_to', [contractorData.name, contractorData.contact_email])
          .eq('status', 'pending')
          .order('due_date', { ascending: true });
        
        if (assignedJobsError) {
          console.error('Error fetching jobs by assigned_to:', assignedJobsError);
          setJobs([]);
        } else {
          setJobs(assignedJobsData || []);
        }
      } else {
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Error in job fetching process:', error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };
  
  const viewAllJobs = () => {
    navigate('/jobs');
  };
  
  const viewJobDetails = (jobId: string) => {
    navigate(`/jobs/details/${jobId}`);
  };
  
  const startJob = (jobId: string, serviceType: string) => {
    // Map service types to their correct landing page routes with proper formatting
    const serviceRouteMap: Record<string, string> = {
      'Test & Tag': 'test-a-tag',
      'RCD Testing': 'rcd-testing',
      'Emergency Lighting': 'emergency-exit-lighting',
      'Emergency Exit Lighting': 'emergency-exit-lighting',
      'Thermal Imaging': 'thermal-imaging',
      'Plumbing': 'plumbing',
      'Air Conditioning': 'air-conditioning'
    };
    
    // Get the correct route segment for this service type
    const serviceRoute = serviceRouteMap[serviceType] || '';
    
    if (serviceRoute) {
      // Navigate to the service landing page with job parameters
      navigate(`/services/landing/${serviceRoute}?jobId=${jobId}&siteId=1&siteName=${encodeURIComponent('Test Site')}`);
    } else {
      console.error(`Unknown service type: ${serviceType}`);
      toast.error('Unsupported service type');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="py-8 text-center">
          <div className="animate-pulse h-6 w-48 bg-gray-200 rounded mb-4 mx-auto"></div>
          <div className="animate-pulse h-24 bg-gray-100 rounded mb-2 mx-auto"></div>
          <div className="animate-pulse h-24 bg-gray-100 rounded mb-2 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-pretance-purple flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-pretance-purple" />
          Upcoming Jobs
        </h3>
        <Button 
          variant="ghost" 
          className="text-pretance-purple hover:text-pretance-dark"
          onClick={viewAllJobs}
        >
          View all
        </Button>
      </div>
      
      <div className="space-y-4">
        {jobs.map((job) => (
          <div 
            key={job.id} 
            className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{job.title}</h4>
              <PriorityBadge priority={job.priority} />
            </div>
            
            <div className="space-y-2 mb-3">
              {job.sites && (
                <div className="flex items-start text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <div>{job.sites.name || 'Unknown Site'}</div>
                    <div className="text-gray-500 text-xs">{job.sites.address || 'No address provided'}</div>
                  </div>
                </div>
              )}
              
              {job.due_date && (
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Due: {new Date(job.due_date).toLocaleDateString()}</span>
                </div>
              )}
              
              {job.estimatedHours && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 text-gray-400 mr-2" />
                  <span>Est. {job.estimatedHours} hours</span>
                </div>
              )}
              
              <div className="flex items-center text-sm text-gray-600">
                <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                <span>{job.service_type}</span>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => viewJobDetails(job.id)}
              >
                Details
              </Button>
              
              <Button 
                size="sm"
                onClick={() => startJob(job.id, job.service_type)}
                className="bg-pretance-purple hover:bg-pretance-purple/90"
              >
                Start Job
              </Button>
            </div>
          </div>
        ))}
        
        {jobs.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No upcoming jobs</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingJobs;
