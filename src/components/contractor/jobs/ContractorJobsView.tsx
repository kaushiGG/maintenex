
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, Building, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Job {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  description?: string;
  service_type: string;
  site_id?: string;
  contractor_id?: string;
  business_sites?: {
    name: string;
    address: string;
  };
  created_at: string;
}

const ContractorJobsView = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchContractorJobs = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      
      try {
        const { data: contractorData, error: contractorError } = await supabase
          .from('contractors')
          .select('id')
          .eq('auth_id', user.id)
          .single();
          
        if (contractorError || !contractorData) {
          console.error('No contractor profile found:', contractorError);
          toast.error('Could not find your contractor profile');
          setLoading(false);
          return;
        }
        
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            *,
            business_sites(name, address)
          `)
          .eq('contractor_id', contractorData.id)
          .order('created_at', { ascending: false });
          
        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          toast.error('Failed to load your jobs');
          setLoading(false);
          return;
        }
        
        setJobs(jobsData || []);
      } catch (error) {
        console.error('Error in job fetching process:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchContractorJobs();
  }, [user?.id]);
  
  const getPriorityBadgeClass = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-200 bg-yellow-50">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
            <Clock className="h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-gray-600 border-gray-200 bg-gray-50">
            {status || 'Unknown'}
          </Badge>
        );
    }
  };
  
  const handleViewDetails = (jobId: string) => {
    navigate(`/jobs/details/${jobId}`);
  };
  
  const handleStartJob = (job: Job) => {
    const serviceRouteMap: Record<string, string> = {
      'test-tag': 'test-a-tag',
      'rcd-testing': 'rcd-testing',
      'emergency-lighting': 'emergency-exit-lighting',
      'thermal-imaging': 'thermal-imaging',
      'plumbing': 'plumbing',
      'air-conditioning': 'air-conditioning'
    };
    
    const serviceRoute = serviceRouteMap[job.service_type] || job.service_type;
    
    if (serviceRoute) {
      if (serviceRoute === 'thermal-imaging') {
        navigate(`/services/thermal-imaging?siteId=${job.site_id || ''}&siteName=${encodeURIComponent(job.business_sites?.name || '')}&siteAddress=${encodeURIComponent(job.business_sites?.address || '')}&jobId=${job.id}`);
      } else {
        navigate(`/services/landing/${serviceRoute}?jobId=${job.id}&siteId=${job.site_id || ''}&siteName=${encodeURIComponent(job.business_sites?.name || '')}`);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Jobs</h2>
      
      {loading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading jobs...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-10">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">No jobs found. When you're assigned to jobs, they will appear here.</p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg font-semibold text-pretance-purple">{job.title}</CardTitle>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{job.business_sites?.name || 'Unknown site'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(job.priority)}`}>
                      {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Normal'}
                    </span>
                    {getStatusBadge(job.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {job.business_sites?.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
                      <span className="text-sm text-gray-600">{job.business_sites.address}</span>
                    </div>
                  )}
                  
                  {job.due_date && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Due: {new Date(job.due_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center">
                    <Briefcase className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">{job.service_type}</span>
                  </div>
                  
                  {job.description && (
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewDetails(job.id)}
                    >
                      View Details
                    </Button>
                    
                    {(job.status === 'pending' || job.status === 'in-progress') && (
                      <Button 
                        size="sm"
                        className="bg-pretance-purple hover:bg-pretance-purple/90"
                        onClick={() => handleStartJob(job)}
                      >
                        {job.status === 'pending' ? 'Start Job' : 'Continue'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractorJobsView;
