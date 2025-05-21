import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  Loader
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useJobDetails } from './hooks/useJobDetails';
import { useJobActions } from './hooks/useJobActions';
import SiteInfoCard from '@/components/services/rcd-testing/SiteInfoCard';

interface JobDetailsPageProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
}

const JobDetailsPage = ({ 
  switchRole, 
  userRole, 
  handleLogout 
}: JobDetailsPageProps) => {
  // Add debug log - TEMPORARY 
  console.log('RENDERING CONTRACTOR JobDetailsPage component with props:', { userRole, portalType: 'contractor' });
  
  const navigate = useNavigate();
  const { job, site, loading } = useJobDetails();
  const { handleStartJob, handleAcceptJob } = useJobActions();
  
  const handleBack = () => {
    navigate(-1);
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
    switch (serviceType) {
      case 'thermal-imaging':
        return <Thermometer className="h-5 w-5 text-gray-400 mt-1 mr-3" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-400 mt-1 mr-3" />;
    }
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <DashboardHeader 
          switchRole={switchRole} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          title="Job Details"
          portalType="contractor"
        />
        <div className="flex min-h-[calc(100vh-64px)]">
          <DashboardSidebar 
            handleLogout={handleLogout}
            portalType="contractor"
          />
          <main className="flex-1 p-4 flex items-center justify-center">
            <p>Loading job details...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <DashboardHeader 
          switchRole={switchRole} 
          userRole={userRole} 
          handleLogout={handleLogout} 
          title="Job Details"
          portalType="contractor"
        />
        <div className="flex min-h-[calc(100vh-64px)]">
          <DashboardSidebar 
            handleLogout={handleLogout}
            portalType="contractor"
          />
          <main className="flex-1 p-4 flex items-center justify-center">
            <p>Job not found</p>
          </main>
        </div>
      </div>
    );
  }
  
  const requirementsChecklist = [
    { id: 1, text: 'Bring testing equipment', completed: true },
    { id: 2, text: 'Safety PPE required', completed: true },
    { id: 3, text: 'Requires site induction', completed: false },
    { id: 4, text: 'After-hours access needed', completed: false }
  ];
  
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
  
  console.log('Site data in JobDetailsPage:', site);
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Job Details"
        portalType="contractor"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="contractor"
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
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-pretance-purple">{job.title}</h1>
                <div className="flex items-center mt-1">
                  <Building className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-gray-600">
                    {site ? site.name : 'Site information unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {job.priority && getPriorityBadge(job.priority)}
                
                {job.status === 'pending' && (
                  <Button onClick={() => handleAcceptJob(job)}>
                    Accept Job
                  </Button>
                )}
                
                {job.status === 'in-progress' && (
                  <Button onClick={() => handleStartJob(job)}>
                    Start Job
                  </Button>
                )}
              </div>
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
                      <p className="text-gray-600">{new Date(job.due_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Estimated Time</p>
                      <p className="text-gray-600">4 hours</p>
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
                  
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Requirements Checklist</p>
                      <ul className="mt-2 space-y-2">
                        {requirementsChecklist.map(item => (
                          <li key={item.id} className="flex items-center">
                            <div className={`h-5 w-5 rounded-full flex items-center justify-center mr-2 ${item.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                              {item.completed ? <CheckCircle className="h-3 w-3" /> : null}
                            </div>
                            <span className={`${item.completed ? 'text-gray-600' : 'text-gray-500'}`}>
                              {item.text}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Site Contact</p>
                      <p className="text-gray-600">{site?.name || 'Not specified'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-gray-600">{site?.contact_phone || 'Not available'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-gray-600">{site?.contact_email || 'Not available'}</p>
                    </div>
                  </div>
                  
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
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobDetailsPage;
