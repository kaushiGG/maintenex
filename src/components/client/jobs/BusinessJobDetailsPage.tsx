import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Building, 
  Wrench, 
  MapPin, 
  Phone, 
  Mail, 
  CheckCircle, 
  AlertTriangle,
  FileText,
  ArrowLeft,
  Thermometer,
  Loader,
  Play
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useJobDetails } from '@/components/contractor/jobs/hooks/useJobDetails';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import SiteInfoCard from '@/components/services/rcd-testing/SiteInfoCard';
import { useBusinessJobActions } from './hooks/useBusinessJobActions';
import { toast } from 'sonner';

interface BusinessJobDetailsPageProps {
  switchRole?: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const BusinessJobDetailsPage = ({ 
  switchRole, 
  userRole = 'business', 
  handleLogout,
  userMode = 'provider'
}: BusinessJobDetailsPageProps) => {
  const navigate = useNavigate();
  const { jobId } = useParams<{ jobId: string }>();
  const { job, site, loading } = useJobDetails(jobId);
  const { handleStartJob, updateJobStatus, startThermalImagingService, startService } = useBusinessJobActions();
  
  console.log('BusinessJobDetailsPage props:', { userRole, userMode, portalType: 'business' });
  console.log('Current path:', window.location.pathname);
  
  React.useEffect(() => {
    console.log('BusinessJobDetailsPage mounted with:', { 
      userRole, 
      userMode, 
      portalType: 'business', 
      path: window.location.pathname 
    });
    
    return () => {
      console.log('BusinessJobDetailsPage unmounted');
    };
  }, [userRole, userMode]);
  
  const handleBack = () => {
    navigate('/business/provider/jobs');
  };
  
  const handleAcceptJob = async () => {
    if (job && job.status === 'pending') {
      try {
        const result = await updateJobStatus(job.id, 'in-progress');
        if (result) {
          toast.success('Job accepted successfully');
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (error) {
        console.error('Error accepting job:', error);
        toast.error('Failed to accept job');
      }
    }
  };
  
  const handleStartServiceJob = () => {
    if (!job) return;
    
    const serviceType = job.service_type?.toLowerCase() || '';
    console.log('Starting service job:', { serviceType });
    
    if (serviceType === 'thermal imaging' || serviceType === 'thermal-imaging') {
      startThermalImagingService(job.id);
      return;
    }
    
    startService(job.service_type || 'Unknown Service', job.id);
  };
  
  const getPriorityBadge = (priority: string) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };
    
    const color = priorityColors[priority as keyof typeof priorityColors] || priorityColors.medium;
    
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const getServiceIcon = (serviceType: string) => {
    switch (serviceType?.toLowerCase()) {
      case 'thermal imaging':
      case 'thermal-imaging':
        return <Thermometer className="h-5 w-5 text-gray-400 mt-1 mr-3" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-400 mt-1 mr-3" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 text-pretance-purple animate-spin mb-2" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <AlertTriangle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-gray-600">Job not found</p>
          <Button className="mt-4" onClick={handleBack}>Back to Jobs</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Job Details"
        portalType="business"
        userMode={userMode}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="business"
          userMode={userMode}
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          <div className="container mx-auto py-6">
            <Button 
              variant="ghost" 
              className="mb-4 text-pretance-purple" 
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
            
            {site && (
              <SiteInfoCard 
                siteName={site.name} 
                siteAddress={site.address} 
              />
            )}
            
            <div className="flex flex-col mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-pretance-purple">{job?.title}</h1>
                  <div className="flex items-center mt-1">
                    <Building className="h-4 w-4 text-gray-500 mr-1" />
                    <span className="text-gray-600">
                      {site ? site.name : 'Site information unavailable'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {job?.priority && getPriorityBadge(job.priority)}
                </div>
              </div>
              
              <div className="mt-4 mb-2">
                {job?.status === 'pending' && (
                  <Button 
                    className="bg-pretance-purple hover:bg-pretance-purple/90 text-white font-semibold px-8 py-3 text-lg flex items-center gap-2" 
                    onClick={handleAcceptJob}
                  >
                    <Play className="h-5 w-5" /> Accept Job
                  </Button>
                )}
                
                {job?.status === 'in-progress' && job?.service_type?.toLowerCase().includes('thermal') && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg flex items-center gap-2 w-full md:w-auto" 
                    onClick={() => startThermalImagingService(job.id)}
                  >
                    <Thermometer className="h-5 w-5" /> 
                    Start Thermal Imaging Inspection
                  </Button>
                )}
                
                {job?.status === 'in-progress' && !job?.service_type?.toLowerCase().includes('thermal') && (
                  <Button 
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 text-lg flex items-center gap-2" 
                    onClick={handleStartServiceJob}
                  >
                    <Play className="h-5 w-5" /> 
                    Start {job?.service_type || 'Service'} Inspection
                  </Button>
                )}
              </div>
              
              {job?.status === 'in-progress' && job?.service_type?.toLowerCase().includes('thermal') && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Thermometer className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        Click the Start Thermal Imaging Inspection button above to begin the thermal imaging process.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-gray-600">
                        {site ? site.address : job.location_details || 'Address not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Due Date</p>
                      <p className="text-gray-600">{job.due_date ? new Date(job.due_date).toLocaleDateString() : 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Estimated Time</p>
                      <p className="text-gray-600">{job.estimated_hours || 4} hours</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    {getServiceIcon(job.service_type)}
                    <div>
                      <p className="font-medium">Service Type</p>
                      <p className="text-gray-600">{job.service_type}</p>
                    </div>
                  </div>
                  
                  {job.description && (
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Description</p>
                        <p className="text-gray-600">{job.description}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.schedule_notes && (
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Important Notes</p>
                        <p className="text-gray-600">{job.schedule_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Status Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Assigned To</p>
                      <p className="text-gray-600">{job.assigned_to || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  {site && (
                    <>
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="font-medium">Site Phone</p>
                          <p className="text-gray-600">{site.contact_phone || 'Not available'}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="font-medium">Site Email</p>
                          <p className="text-gray-600">{site.contact_email || 'Not available'}</p>
                        </div>
                      </div>
                    </>
                  )}
                  
                  {job.assignment_notes && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      <p className="font-medium mb-2">Assignment Notes</p>
                      <p className="text-gray-600 text-sm">{job.assignment_notes}</p>
                    </div>
                  )}
                  
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <p className="font-medium">Job Status</p>
                    <Badge 
                      className={`mt-2 ${job.status === 'completed' ? 'bg-green-500 hover:bg-green-600' : ''}`} 
                      variant={job.status === 'completed' ? 'default' : job.status === 'in-progress' ? 'default' : 'outline'}
                    >
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                    </Badge>
                  </div>
                  
                  {job.start_time && (
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Started</p>
                        <p className="text-gray-600">{new Date(job.start_time).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  {job.completion_time && (
                    <div className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                      <div>
                        <p className="font-medium">Completed</p>
                        <p className="text-gray-600">{new Date(job.completion_time).toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default BusinessJobDetailsPage; 