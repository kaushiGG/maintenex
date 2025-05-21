import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Filter, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  Building, 
  Wrench, 
  User, 
  Star, 
  AlertCircle, 
  CheckCircle,
  Loader2,
  Hammer,
  Briefcase,
  Info
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Job } from '@/types/job';
import { Contractor } from '@/types/contractor';

interface ActiveJobsPageProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
}

const ActiveJobsPage = ({ switchRole, userRole, handleLogout }: ActiveJobsPageProps) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterService, setFilterService] = useState('all');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [contractors, setContractors] = useState<Record<string, Contractor>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [siteNames, setSiteNames] = useState<Record<string, string>>({});
  const [equipmentMap, setEquipmentMap] = useState<Record<string, string>>({});

  // Get user name from metadata
  const firstName = user?.user_metadata?.firstName || '';
  const lastName = user?.user_metadata?.lastName || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : 'Business User';
  const email = user?.email || 'business@example.com';

  const fetchJobsData = async () => {
    console.log('Fetching jobs data...');
    setIsLoading(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['pending', 'in-progress'])
        .order('created_at', { ascending: false });

      console.log('Jobs query response:', { 
        success: !jobsError, 
        error: jobsError?.message, 
        count: jobsData?.length || 0
      });

      if (jobsError) {
        throw jobsError;
      }

      if (jobsData && jobsData.length > 0) {
        console.log('Found jobs:', jobsData);
        setJobs(jobsData.map(job => ({
          ...job,
          progress: job.status === 'pending' ? 0 : job.status === 'in-progress' ? 50 : 0
        })));

        if (!selectedJob && jobsData.length > 0) {
          setSelectedJob(jobsData[0].id);
        }

        const siteIds = jobsData
          .filter(job => job.site_id)
          .map(job => job.site_id);

        if (siteIds.length > 0) {
          const { data: sitesData } = await supabase
            .from('business_sites')
            .select('id, name')
            .in('id', siteIds);

          if (sitesData) {
            const siteNameMap: Record<string, string> = {};
            sitesData.forEach(site => {
              siteNameMap[site.id] = site.name;
            });
            setSiteNames(siteNameMap);
          }
        }

        const equipmentIds = jobsData
          .filter(job => job.equipment_id)
          .map(job => job.equipment_id);

        if (equipmentIds.length > 0) {
          const { data: equipmentData } = await supabase
            .from('equipment')
            .select('id, name, model')
            .in('id', equipmentIds);

          if (equipmentData) {
            const equipmentNameMap: Record<string, string> = {};
            equipmentData.forEach(item => {
              equipmentNameMap[item.id] = `${item.name}${item.model ? ` (${item.model})` : ''}`;
            });
            setEquipmentMap(equipmentNameMap);
          }
        }

        const assignedContractorIds = jobsData
          .filter(job => job.contractor_id && job.contractor_id !== '')
          .map(job => job.contractor_id as string);

        if (assignedContractorIds.length > 0) {
          const validContractorIds = assignedContractorIds
            .filter(id => typeof id === 'string' && id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i));
          
          if (validContractorIds.length > 0) {
            console.log("Fetching contractors with IDs:", validContractorIds);
            
            const { data: contractorsData, error: contractorsError } = await supabase
              .from('contractors')
              .select('*')
              .in('id', validContractorIds);
              
            if (contractorsError) {
              console.error('Error fetching contractors:', contractorsError);
            } else if (contractorsData && contractorsData.length > 0) {
              const contractorMap: Record<string, Contractor> = {};
              
              contractorsData.forEach(contractor => {
                contractorMap[contractor.id] = {
                  id: contractor.id,
                  name: contractor.name || 'Unnamed Contractor',
                  service_type: contractor.service_type || 'General Services',
                  status: contractor.status || 'Active',
                  contact_email: contractor.contact_email || 'Contact information not available',
                  contact_phone: contractor.contact_phone || 'Not provided',
                  location: contractor.location || 'Not specified',
                  
                  // Optional fields for compatibility
                  company: 'Contractor Company',
                  phone: contractor.contact_phone || 'Not provided',
                  email: contractor.contact_email || 'Contact information not available',
                  rating: 4.5,
                  completedJobs: Math.floor(Math.random() * 50) + 10,
                  photo: '/placeholder.svg',
                  serviceType: contractor.service_type || 'General Services'
                };
              });
              
              setContractors(contractorMap);
              console.log("Contractor data set:", contractorMap);
            }
            
            // Fix the profiles query by selecting the correct fields
            const { data: profilesData, error: profilesError } = await supabase
              .from('profiles')
              .select('id, first_name, last_name, company, phone')
              .in('id', validContractorIds);

            if (profilesError) {
              console.error('Error fetching contractor profiles:', profilesError);
            } else if (profilesData && profilesData.length > 0) {
              const updatedContractorMap = {...contractors};
              
              profilesData.forEach(profile => {
                if (profile && profile.id) {
                  const existingContractor = updatedContractorMap[profile.id] || {};
                  updatedContractorMap[profile.id] = {
                    id: profile.id,
                    name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 
                          (existingContractor?.name || 'Unnamed Contractor'),
                    service_type: existingContractor?.service_type || 'General Services',
                    status: existingContractor?.status || 'Active',
                    contact_email: existingContractor?.contact_email || 'No email',
                    contact_phone: profile.phone || existingContractor?.contact_phone || 'Not provided',
                    location: existingContractor?.location || 'Not specified',
                    
                    // Optional fields for compatibility with legacy code
                    company: profile.company || (existingContractor?.company || 'Independent Contractor'),
                    phone: profile.phone || (existingContractor?.phone || 'Not provided'),
                    email: existingContractor?.email,
                    serviceType: existingContractor?.serviceType,
                    rating: existingContractor?.rating || 4.5,
                    completedJobs: existingContractor?.completedJobs || 0
                  };
                }
              });
              
              setContractors(updatedContractorMap);
            }
          }
        }
      } else {
        console.log('No active jobs found. Adding a test job for debugging.');
        // Create a test job for debugging purposes
        const testJob = {
          id: 'test-job-id',
          title: 'Test Job (Dev Only)',
          description: 'This is a test job for development purposes.',
          status: 'pending',
          priority: 'medium',
          service_type: 'test-tag',
          progress: 25,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          assigned_to: 'Test Contractor',
          site_id: 'test-site-id',
          location_details: 'Test Location',
          start_date: new Date().toISOString(),
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // One week from now
          contractor_id: null
        };
        
        setJobs([testJob]);
        setSelectedJob('test-job-id');
        
        // Add a test site name
        setSiteNames({
          'test-site-id': 'Test Site Location'
        });
      }
    } catch (error: any) {
      console.error('Error fetching jobs data:', error);
      toast.error(`Failed to load jobs: ${error.message}`);
    } finally {
      setIsLoading(false);
      console.log('Finished fetching jobs data.');
    }
  };

  // Function to check database connection
  const checkDatabaseConnection = async () => {
    console.log('Checking database connection...');
    try {
      // Try a simple query to a table that should exist
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Database connection test failed:', error);
        return false;
      }
      
      console.log('Database connection test succeeded!');
      return true;
    } catch (err) {
      console.error('Error testing database connection:', err);
      return false;
    }
  };

  // Function to check if the jobs table exists and is accessible
  const checkJobsTable = async () => {
    console.log('Checking jobs table access...');
    try {
      // Try a simple query to the jobs table without filters
      const { data, error } = await supabase
        .from('jobs')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('Jobs table access check failed:', error);
        return { success: false, error: error.message };
      }
      
      // If that worked, try to get all jobs to see if any exist
      const { data: allJobs, error: allJobsError } = await supabase
        .from('jobs')
        .select('id, title, status')
        .limit(10);
        
      if (allJobsError) {
        console.error('Failed to fetch sample jobs:', allJobsError);
        return { success: true, hasJobs: false };
      }
      
      console.log('Sample jobs:', allJobs);
      return { 
        success: true, 
        hasJobs: allJobs && allJobs.length > 0,
        sampleJobs: allJobs 
      };
    } catch (err) {
      console.error('Error testing jobs table access:', err);
      return { success: false, error: String(err) };
    }
  };

  useEffect(() => {
    console.log('Setting up jobs page and real-time subscription');
    
    // First check database connection
    checkDatabaseConnection().then(isConnected => {
      if (isConnected) {
        // Then check jobs table specifically
        checkJobsTable().then(result => {
          if (result.success) {
            console.log('Jobs table accessible:', result);
            fetchJobsData();
          } else {
            console.error('Jobs table not accessible:', result.error);
            setIsLoading(false);
            toast.error('Could not access jobs data. Please contact support.');
          }
        });
      } else {
        console.error('Not fetching jobs because database connection failed');
        setIsLoading(false);
        toast.error('Could not connect to the database. Please refresh or try again later.');
      }
    });
    
    // Set up real-time subscription to the jobs table - removing the filter to catch all job changes
    const jobsSubscription = supabase
      .channel('jobs_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'jobs'
          // Removing the filter to catch all job changes
        }, 
        (payload) => {
          console.log('Job data changed:', payload);
          // Refresh data when jobs change
          fetchJobsData();
        }
      )
      .subscribe();
      
    console.log('Real-time subscription set up');
    
    // Clean up subscription on component unmount
    return () => {
      console.log('Cleaning up jobs subscription');
      jobsSubscription.unsubscribe();
    };
  }, []);

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'urgent':
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 0) return 'bg-gray-200';
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const formatDateDisplay = (dateString?: string | null) => {
    try {
      if (!dateString) return 'Not scheduled';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Date error';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (siteNames[job.site_id as string] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.contractor_id && contractors[job.contractor_id]?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = filterPriority === 'all' || job.priority === filterPriority;
    const matchesService = filterService === 'all' || job.service_type === filterService;

    return matchesSearch && matchesPriority && matchesService;
  });

  const selectedJobDetails = selectedJob ? jobs.find(job => job.id === selectedJob) : null;

  const selectedJobContractor = selectedJobDetails?.contractor_id 
    ? contractors[selectedJobDetails.contractor_id]
    : null;

  const selectedJobSite = selectedJobDetails?.site_id 
    ? siteNames[selectedJobDetails.site_id]
    : 'Unknown Site';

  const getServiceName = (serviceType: string): string => {
    const serviceMap: Record<string, string> = {
      'test-tag': 'Test & Tag',
      'rcd-testing': 'RCD Testing',
      'emergency-lighting': 'Emergency Lighting',
      'thermal-imaging': 'Thermal Imaging',
      'plumbing': 'Plumbing',
      'air-conditioning': 'Air Conditioning'
    };

    return serviceMap[serviceType] || serviceType;
  };

  const getEquipmentName = (equipmentId: string): string => {
    // If we have the name in our map, use it
    if (equipmentMap[equipmentId]) {
      return equipmentMap[equipmentId];
    }
    
    // If we have the raw text, use that
    const job = jobs.find(j => j.equipment_id === equipmentId);
    if (job?.equipment) {
      return job.equipment;
    }
    
    // Fallback
    return 'Equipment ' + equipmentId.substring(0, 8);
  };

  // Handle logout properly using the auth context
  const handleLogoutClick = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole="business" 
        handleLogout={handleLogoutClick} 
        title="Active Jobs"
        portalType="business"
        userMode="management"
        userData={{
          fullName,
          email,
          userType: 'business'
        }}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogoutClick}
          portalType="business"
          userMode="management"
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 bg-gray-50 overflow-x-hidden">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-pretance-purple sm:text-2xl sm:tracking-tight">
                Active Jobs Management
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Monitor and manage all active jobs and assigned contractors
              </p>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-pretance-purple" />
              <span className="ml-2 text-lg">Loading jobs...</span>
            </div>
          ) : (
            <div className="lg:grid lg:grid-cols-3 lg:gap-6">
              <div className="lg:col-span-1">
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Active Jobs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search jobs or contractors..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col md:flex-row gap-2 mb-4">
                      <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Priorities</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="urgent">Urgent</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={filterService} onValueChange={setFilterService}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Service Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Services</SelectItem>
                          <SelectItem value="test-tag">Test & Tag</SelectItem>
                          <SelectItem value="rcd-testing">RCD Testing</SelectItem>
                          <SelectItem value="emergency-lighting">Emergency Lighting</SelectItem>
                          <SelectItem value="thermal-imaging">Thermal Imaging</SelectItem>
                          <SelectItem value="plumbing">Plumbing</SelectItem>
                          <SelectItem value="air-conditioning">Air Conditioning</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3 mt-4">
                      {filteredJobs.length > 0 ? (
                        filteredJobs.map((job) => (
                          <div 
                            key={job.id} 
                            className={`p-3 border rounded-md cursor-pointer transition-colors ${
                              selectedJob === job.id 
                                ? 'border-pretance-purple bg-pretance-purple/5' 
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedJob(job.id)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-medium text-pretance-purple">{job.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  <span className="flex items-center">
                                    <Building className="h-3 w-3 mr-1" /> 
                                    {job.site_id ? siteNames[job.site_id] || 'Unknown Site' : 'No Site Assigned'}
                                  </span>
                                </p>
                              </div>
                              <Badge className={getPriorityBadge(job.priority || 'medium')}>
                                {(job.priority || 'medium').charAt(0).toUpperCase() + (job.priority || 'medium').slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="mt-2">
                              {job.contractor_id && contractors[job.contractor_id] ? (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1" /> 
                                  {contractors[job.contractor_id].name}
                                </p>
                              ) : (
                                <p className="text-xs text-gray-500 flex items-center">
                                  <User className="h-3 w-3 mr-1" /> 
                                  {job.assigned_to || 'Not assigned'}
                                </p>
                              )}
                              <p className="text-xs text-gray-500 flex items-center mt-1">
                                <Wrench className="h-3 w-3 mr-1" /> 
                                {getServiceName(job.service_type)}
                              </p>
                            </div>
                            
                            <div className="mt-2">
                              <div className="text-xs text-gray-500 mb-1">Progress: {job.progress || 0}%</div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`${getProgressColor(job.progress || 0)} h-1.5 rounded-full`} 
                                  style={{ width: `${job.progress || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No jobs matching your criteria</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-2">
                {selectedJobDetails ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{selectedJobDetails.title}</CardTitle>
                          <Badge className={getPriorityBadge(selectedJobDetails.priority || 'medium')}>
                            {(selectedJobDetails.priority || 'medium').charAt(0).toUpperCase() + (selectedJobDetails.priority || 'medium').slice(1)} Priority
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-3">Job Details</h3>
                            <div className="space-y-2">
                              <div className="flex items-start">
                                <Building className="h-4 w-4 text-gray-400 mt-0.5 mr-2" />
                                <div>
                                  <p className="text-sm font-medium">{selectedJobSite}</p>
                                  <p className="text-xs text-gray-500">
                                    {selectedJobDetails.location_details || 'No specific location details'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center">
                                <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                                <p className="text-sm">{getServiceName(selectedJobDetails.service_type)}</p>
                              </div>
                              
                              {selectedJobDetails.equipment_id && (
                                <div className="flex items-center">
                                  <Hammer className="h-4 w-4 text-gray-400 mr-2" />
                                  <p className="text-sm">
                                    Equipment: {getEquipmentName(selectedJobDetails.equipment_id)}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                <div>
                                  <p className="text-sm">
                                    Start: {formatDateDisplay(selectedJobDetails.start_date)}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Due: {formatDateDisplay(selectedJobDetails.due_date)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-600 mb-2">Progress</h4>
                              <div className="flex items-center">
                                <div className="flex-1">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`${getProgressColor(selectedJobDetails.progress || 0)} h-2 rounded-full`} 
                                      style={{ width: `${selectedJobDetails.progress || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="ml-2 text-sm font-medium">{selectedJobDetails.progress || 0}%</span>
                              </div>
                              <div className="mt-2 flex justify-between text-xs text-gray-500">
                                <span>Started</span>
                                <span>In Progress</span>
                                <span>Completed</span>
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-gray-600 mb-3">Assigned Contractor</h3>
                            {selectedJobContractor ? (
                              <>
                                <div className="flex items-start mb-3">
                                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-3">
                                    <img 
                                      src={selectedJobContractor.photo || '/placeholder.svg'}
                                      alt={selectedJobContractor.name}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <p className="font-medium">{selectedJobContractor.name}</p>
                                    <p className="text-sm text-gray-500">{selectedJobContractor.company}</p>
                                    <div className="flex items-center mt-1">
                                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                      <span className="text-sm ml-1">{selectedJobContractor.rating}</span>
                                      <span className="text-xs text-gray-500 ml-2">
                                        ({selectedJobContractor.completedJobs} jobs completed)
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center">
                                    <Phone className="h-4 w-4 text-gray-400 mr-2" />
                                    <p className="text-sm">{selectedJobContractor.phone}</p>
                                  </div>
                                  
                                  <div className="flex items-center">
                                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                                    <p className="text-sm">{selectedJobContractor.email}</p>
                                  </div>
                                  
                                  {selectedJobContractor.serviceType && (
                                    <div className="flex items-center">
                                      <Wrench className="h-4 w-4 text-gray-400 mr-2" />
                                      <p className="text-sm">{selectedJobContractor.serviceType}</p>
                                    </div>
                                  )}
                                </div>
                              </>
                            ) : selectedJobDetails.assignment_notes?.includes('[BUSINESS_SELF_ASSIGNED]') || 
                               (selectedJobDetails.assigned_to && selectedJobDetails.assigned_to.includes(firstName) && 
                                selectedJobDetails.job_type === 'self_assigned') ? (
                              <>
                                <div className="flex items-start mb-3">
                                  <div className="h-12 w-12 rounded-full overflow-hidden bg-orange-100 mr-3">
                                    <div className="h-full w-full flex items-center justify-center bg-orange-100">
                                      <Briefcase className="h-6 w-6 text-orange-600" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium">{selectedJobDetails.assigned_to}</p>
                                    <p className="text-sm text-gray-500">Business User (Self-Assigned)</p>
                                  </div>
                                </div>
                                <div className="p-3 bg-orange-50 border border-orange-200 rounded-md">
                                  <p className="text-sm text-orange-800">
                                    <Info className="h-4 w-4 inline mr-1" />
                                    This job is self-assigned and will be handled by your business account
                                  </p>
                                </div>
                              </>
                            ) : selectedJobDetails.assigned_to ? (
                              <>
                                <div className="flex items-start mb-3">
                                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-100 mr-3">
                                    <div className="h-full w-full flex items-center justify-center bg-pretance-purple/10">
                                      <User className="h-6 w-6 text-pretance-purple" />
                                    </div>
                                  </div>
                                  <div>
                                    <p className="font-medium">{selectedJobDetails.assigned_to}</p>
                                    <p className="text-sm text-gray-500">Assigned Contractor</p>
                                  </div>
                                </div>
                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                  <p className="text-sm text-yellow-800">
                                    <AlertCircle className="h-4 w-4 inline mr-1" />
                                    Contractor details not available in the system
                                  </p>
                                </div>
                              </>
                            ) : (
                              <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-md">
                                <User className="h-8 w-8 text-gray-400 mb-2" />
                                <p className="text-gray-600">No contractor assigned</p>
                                <p className="text-xs text-gray-500 mt-1">Please assign a contractor to this job</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200 mt-4">
                          <div className="flex justify-between">
                            <div>
                              {selectedJobDetails.status === 'pending' && (selectedJobDetails.contractor_id || selectedJobDetails.assigned_to) ? (
                                <Badge variant="outline" className="border-blue-500 text-blue-500">
                                  <User className="h-4 w-4 mr-1" />
                                  Assigned
                                </Badge>
                              ) : selectedJobDetails.status === 'pending' ? (
                                <Badge variant="outline" className="border-orange-500 text-orange-500">
                                  <AlertCircle className="h-4 w-4 mr-1" />
                                  Pending
                                </Badge>
                              ) : selectedJobDetails.progress === 100 ? (
                                <Badge className="bg-green-500 text-white">
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Complete
                                </Badge>
                              ) : (
                                <Badge className="bg-pretance-purple text-white">
                                  <Clock className="h-4 w-4 mr-1" />
                                  In Progress
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Tabs defaultValue="updates">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="updates">Updates</TabsTrigger>
                        <TabsTrigger value="documents">Documents</TabsTrigger>
                        <TabsTrigger value="history">History</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="updates">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="space-y-4">
                              <div className="flex items-start">
                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Job created</p>
                                  <p className="text-xs text-gray-500">Job has been created and is awaiting assignment</p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(selectedJobDetails.created_at).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                              
                              {(selectedJobDetails.contractor_id || selectedJobDetails.assigned_to) && (
                                <div className="flex items-start">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                    <User className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Contractor assigned</p>
                                    <p className="text-xs text-gray-500">
                                      {selectedJobContractor?.name || selectedJobDetails.assigned_to || 'Contractor'} has been assigned to this job
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(selectedJobDetails.updated_at).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {selectedJobDetails.status !== 'pending' && (
                                <div className="flex items-start">
                                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                                    <Clock className="h-4 w-4 text-blue-600" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Work started</p>
                                    <p className="text-xs text-gray-500">Contractor has begun work on this job</p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {selectedJobDetails.start_date ? 
                                        new Date(selectedJobDetails.start_date).toLocaleString() : 
                                        'Date not specified'}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="documents">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center py-6">
                              <p className="text-gray-500">No documents available yet</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                      
                      <TabsContent value="history">
                        <Card>
                          <CardContent className="pt-6">
                            <div className="text-center py-6">
                              <p className="text-gray-500">No history entries available</p>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-40">
                      {filteredJobs.length > 0 ? (
                        <p className="text-gray-500">Select a job to view details</p>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500">No active jobs found</p>
                          <Button 
                            className="mt-4 bg-pretance-purple"
                            onClick={() => navigate('/jobs/assign')}
                          >
                            Assign New Job
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ActiveJobsPage;
