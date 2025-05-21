import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, Building, Wrench, MapPin, Thermometer, User, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useJobActions } from './hooks/useJobActions';
import { fetchUserJobs } from '@/lib/supabase-functions';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';

const mockJobs = [
  {
    id: 1,
    title: 'Test & Tag Equipment',
    site: 'Brisbane Office',
    address: '123 Queen Street, Brisbane, QLD',
    dueDate: '2023-11-28',
    status: 'upcoming',
    service: 'Test & Tag',
    estimatedHours: 4,
    priority: 'high'
  },
  {
    id: 2,
    title: 'RCD Testing',
    site: 'Sydney Headquarters',
    address: '456 George Street, Sydney, NSW',
    dueDate: '2023-11-30',
    status: 'upcoming',
    service: 'RCD Testing',
    estimatedHours: 6,
    priority: 'medium'
  },
  {
    id: 3,
    title: 'Emergency Lighting Check',
    site: 'Melbourne Branch',
    address: '789 Collins Street, Melbourne, VIC',
    dueDate: '2023-12-05',
    status: 'upcoming',
    service: 'Emergency Lighting',
    estimatedHours: 3,
    priority: 'low'
  },
  {
    id: 4,
    title: 'Test & Tag Update',
    site: 'Perth Office',
    address: '321 Murray Street, Perth, WA',
    dueDate: '2023-11-15',
    status: 'in-progress',
    service: 'Test & Tag',
    estimatedHours: 5,
    priority: 'high',
    startedAt: '2023-11-14'
  },
  {
    id: 5,
    title: 'RCD Testing Phase 1',
    site: 'Adelaide Branch',
    address: '654 North Terrace, Adelaide, SA',
    dueDate: '2023-11-10',
    status: 'in-progress',
    service: 'RCD Testing',
    estimatedHours: 8,
    priority: 'urgent',
    startedAt: '2023-11-09'
  },
  {
    id: 6,
    title: 'Emergency Lighting Replacement',
    site: 'Hobart Store',
    address: '987 Elizabeth Street, Hobart, TAS',
    dueDate: '2023-10-28',
    status: 'completed',
    service: 'Emergency Lighting',
    estimatedHours: 4,
    priority: 'medium',
    completedAt: '2023-10-27'
  },
  {
    id: 7,
    title: 'Annual RCD Audit',
    site: 'Darwin Office',
    address: '159 Mitchell Street, Darwin, NT',
    dueDate: '2023-10-15',
    status: 'completed',
    service: 'RCD Testing',
    estimatedHours: 7,
    priority: 'high',
    completedAt: '2023-10-14'
  },
  {
    id: 8,
    title: 'Switchboard Thermal Inspection',
    site: 'Adelaide Center',
    address: '654 Adelaide Ln, Adelaide SA',
    dueDate: '2023-11-25',
    status: 'upcoming',
    service: 'Thermal Imaging',
    estimatedHours: 3,
    priority: 'high'
  },
  {
    id: 9,
    title: 'Equipment Heat Analysis',
    site: 'Brisbane Tech Park',
    address: '789 Tech Avenue, Brisbane QLD',
    dueDate: '2023-12-10',
    status: 'upcoming',
    service: 'Thermal Imaging',
    estimatedHours: 2,
    priority: 'medium'
  }
];

const PriorityBadge = ({ priority }: { priority: string }) => {
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

const JobCard = ({ job }: { job: any }) => {
  const navigate = useNavigate();
  const { updateJobStatus } = useJobActions();
  
  const handleViewDetails = () => {
    navigate(`/jobs/details/${job.id}`);
  };
  
  const handleStartJob = () => {
    const serviceRouteMap: Record<string, string> = {
      'Test & Tag': 'test-a-tag',
      'RCD Testing': 'rcd-testing',
      'Emergency Lighting': 'emergency-exit-lighting',
      'Thermal Imaging': 'thermal-imaging',
      'Plumbing': 'plumbing',
      'Air Conditioning': 'air-conditioning'
    };
    
    const serviceRoute = serviceRouteMap[job.service] || '';
    
    if (serviceRoute) {
      if (serviceRoute === 'thermal-imaging') {
        navigate(`/services/thermal-imaging?siteId=5&siteName=${encodeURIComponent(job.site)}&siteAddress=${encodeURIComponent(job.address)}&jobId=${job.id}`);
      } else {
        navigate(`/services/landing/${serviceRoute}?jobId=${job.id}&siteId=1&siteName=${encodeURIComponent(job.site)}`);
      }
    } else {
      console.error(`Unknown service type: ${job.service}`);
    }
  };
  
  const handleCompleteJob = async () => {
    try {
      console.log('Completing job with ID:', job.id);
      
      // This will automatically record the completion_time and calculate time_spent
      const result = await updateJobStatus(job.id, 'completed');
      
      if (result) {
        // Update UI to show job as completed
        job.status = 'completed';
        
        console.log('Job completed successfully');
        toast.success('Job completed successfully!');
      }
    } catch (err) {
      console.error('Error in handleCompleteJob:', err);
      toast.error('An error occurred while completing the job');
    }
  };
  
  const getServiceIcon = () => {
    switch (job.service) {
      case 'Thermal Imaging':
        return <Thermometer className="h-4 w-4 text-gray-400 mr-2" />;
      default:
        return <Wrench className="h-4 w-4 text-gray-400 mr-2" />;
    }
  };

  const getStatusBadge = () => {
    switch(job.status) {
      case 'pending':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-yellow-600 border-yellow-200 bg-yellow-50">
            <Clock className="h-3 w-3" />
            Pending Acceptance
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-red-600 border-red-200 bg-red-50">
            <X className="h-3 w-3" />
            Declined
          </Badge>
        );
      case 'accepted':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-blue-600 border-blue-200 bg-blue-50">
            <CheckCircle className="h-3 w-3" />
            Accepted
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="flex items-center gap-1 text-purple-600 border-purple-200 bg-purple-50">
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
        return null;
    }
  };
  
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-semibold text-pretance-purple">{job.title}</CardTitle>
            <div className="flex items-center text-sm text-gray-500 mt-1">
              <Building className="h-4 w-4 mr-1" />
              <span>{job.site}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={job.priority} />
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-start">
            <MapPin className="h-4 w-4 text-gray-400 mt-1 mr-2" />
            <span className="text-sm text-gray-600">{job.address}</span>
          </div>
          
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Due: {new Date(job.dueDate).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">Est. {job.estimatedHours} hours</span>
          </div>
          
          <div className="flex items-center">
            {getServiceIcon()}
            <span className="text-sm text-gray-600">{job.service}</span>
          </div>

          {job.assignedTo && (
            <div className="flex items-center">
              <User className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Assigned to: {job.assignedTo}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
            
            {(job.status === 'pending' || job.status === 'accepted') && (
              <Button 
                size="sm"
                className="bg-pretance-purple hover:bg-pretance-purple/90"
                onClick={handleStartJob}
              >
                {job.status === 'pending' ? 'Accept & Start' : 'Start Job'}
              </Button>
            )}
            
            {job.status === 'completed' && (
              <Badge variant="outline" className="flex items-center gap-1 text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface MyJobsListProps {
  userRole?: 'business' | 'contractor';
  userMode?: UserMode;
}

const MyJobsList: React.FC<MyJobsListProps> = ({
  userRole = 'contractor',
  userMode = 'provider'
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{firstName: string, lastName: string, email: string} | null>(null);
  
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['upcoming', 'in-progress', 'completed', 'all'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email')
          .eq('id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching profile:', error);
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
        console.error('Error fetching profile data:', error);
      }
    };
    
    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        
        if (!user?.id) return;
        
        console.log(`Fetching jobs for ${userRole} user in ${userMode} mode`);
        const { data, error } = await fetchUserJobs(user.id, userRole, userMode);
        
        if (error) {
          console.error('Error fetching jobs:', error);
          toast.error('Failed to load jobs');
          return;
        }
        
        if (data && data.length > 0) {
          console.log(`Loaded ${data.length} jobs for user:`, user.id);
          setJobs(data);
        } else {
          console.log('No jobs found for user, using mock data for demonstration');
          setJobs(mockJobs);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
  }, [user?.id, userRole, userMode]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/jobs?tab=${value}`);
  };
  
  const filteredJobs = jobs.filter((job: any) => {
    if (activeTab === 'all') return true;
    return job.status === activeTab;
  });
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-pretance-purple">My Jobs</h1>
          {profile && (
            <div className="text-sm text-gray-600 mt-1">
              <p>{profile.firstName} {profile.lastName}</p>
              <p>{profile.email}</p>
            </div>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upcoming" className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No upcoming jobs found.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="in-progress" className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No jobs in progress.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No completed jobs.</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="all" className="space-y-4">
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job: any) => <JobCard key={job.id} job={job} />)
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500">No jobs found.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyJobsList;
