import React, { useState, useEffect } from 'react';
import { Site } from '@/types/site';
import { Contractor } from '@/types/contractor';
import { Job } from '@/types/job';
import useContractorAssignments from '@/hooks/useContractorAssignments';
import AssignmentsTable from './assignments/AssignmentsTable';
import AssignmentDialog from './assignments/AssignmentDialog';
import { 
  fetchSites, 
  fetchContractors,
  fetchSiteContractors 
} from '@/services/contractorAssignmentService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, User, Wrench, CircleAlert, Mail, Phone } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface ContractorAssignmentsProps {
  sites?: Site[];
  viewOnly?: boolean; // New prop to control view-only mode
}

// Update the job type to include the joined sites data
interface JobWithSite extends Job {
  sites?: {
    id: string;
    name: string;
    address: string;
  } | null;
  // Include the original field from the query
  business_sites?: {
    id: string;
    name: string;
    address: string;
  } | null;
}

const ContractorAssignments: React.FC<ContractorAssignmentsProps> = ({ 
  sites: initialSites,
  viewOnly = false // Default to false to maintain backward compatibility
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [sites, setSites] = useState<Site[]>(initialSites || []);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [selectedSite, setSelectedSiteView] = useState<Site | null>(null);
  const [activeTab, setActiveTab] = useState<string>('sites');
  const [activeJobs, setActiveJobs] = useState<JobWithSite[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobWithSite | null>(null);
  const [jobContractors, setJobContractors] = useState<Record<string, Contractor>>({});
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (initialSites?.length) {
      setSites(initialSites);
      const loadContractorData = async () => {
        try {
          const contractorsData = await fetchContractors();
          setContractors(contractorsData);
          
          const { updatedSites } = await fetchSiteContractors(initialSites);
          console.log('Updated sites with contractors:', updatedSites);
          setSites(updatedSites);
        } catch (error) {
          console.error('Error loading contractor data:', error);
          toast.error('Failed to load contractor data');
        } finally {
          setIsLoading(false);
        }
      };
      
      loadContractorData();
      return;
    }
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const sitesData = await fetchSites();
        const contractorsData = await fetchContractors();
        
        const { updatedSites, mapping } = await fetchSiteContractors(sitesData);
        console.log('Sites with contractors:', updatedSites);
        
        setSites(updatedSites);
        setContractors(contractorsData);
      } catch (error) {
        console.error('Error loading site and contractor data:', error);
        toast.error('Failed to load site and contractor data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [initialSites]);

  // Fetch active jobs data when the active tab is "active-jobs"
  useEffect(() => {
    if (activeTab === 'active-jobs') {
      fetchActiveJobs();
    }
  }, [activeTab]);

  // Fetch active jobs with pending or in-progress status
  const fetchActiveJobs = async () => {
    setLoadingJobs(true);
    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          *,
          business_sites!site_id(id, name, address)
        `)
        .in('status', ['pending', 'in-progress'])
        .order('due_date', { ascending: true });

      if (jobsError) {
        throw jobsError;
      }

      if (jobsData) {
        console.log('Jobs with sites data:', jobsData);
        
        // Map the response to our JobWithSite interface
        const jobsWithSiteData = jobsData.map(job => ({
          ...job,
          sites: job.business_sites || null
        }));
        
        setActiveJobs(jobsWithSiteData);
        
        // Fetch contractor details for each job that has a contractor assigned
        const contractorIds = jobsData
          .filter(job => job.contractor_id)
          .map(job => job.contractor_id)
          .filter((id, index, array) => id && array.indexOf(id) === index); // Remove duplicates and nulls
        
        if (contractorIds.length > 0) {
          const { data: contractorData, error: contractorError } = await supabase
            .from('contractors')
            .select('*')
            .in('id', contractorIds as string[]);
            
          if (contractorError) {
            console.error('Error fetching contractor details:', contractorError);
          } else if (contractorData) {
            const contractorMap: Record<string, Contractor> = {};
            contractorData.forEach(contractor => {
              contractorMap[contractor.id] = {
                id: contractor.id,
                name: contractor.name || 'Unknown Contractor',
                contact_email: contractor.contact_email || 'No email',
                contact_phone: contractor.contact_phone || 'No phone',
                service_type: contractor.service_type || 'Multiple services',
                rating: contractor.rating || 0,
                status: contractor.status || 'active',
                location: contractor.location || 'Unknown location' // Add the required location field
              };
            });
            setJobContractors(contractorMap);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching active jobs:', error);
      toast.error('Failed to load active jobs');
    } finally {
      setLoadingJobs(false);
    }
  };

  const {
    assignDialogOpen,
    selectedSite: selectedSiteForEdit,
    selectedContractor,
    isEditing,
    isSubmitting,
    setAssignDialogOpen,
    handleOpenAssignDialog,
    handleSiteChange,
    handleContractorChange,
    handleAssignContractor,
    handleDeleteContractor
  } = useContractorAssignments(sites, setSites);

  const handleSiteSelection = (site: Site) => {
    setSelectedSiteView(site);
  };

  const handleJobSelection = (job: JobWithSite) => {
    setSelectedJob(job);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleDateString();
  };

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return 'bg-gray-100 text-gray-800';
    
    switch (priority.toLowerCase()) {
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

  const getFilteredJobs = () => {
    if (statusFilter === 'all') {
      return activeJobs;
    }
    return activeJobs.filter(job => job.status === statusFilter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          {/* <h2 className="text-2xl font-bold text-gray-800">Site-Contractor Assignments</h2> */}
          <p className="text-gray-500">{viewOnly ? 'View contractors assigned to each site' : 'Manage contractors assigned to each site'}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sites">Site Assignments</TabsTrigger>
          <TabsTrigger value="active-jobs">Active Jobs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sites">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Site-Contractor Relationships</h3>
            {!viewOnly && (
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsLoading(true);
                  // Manually refresh site assignments
                  const refreshData = async () => {
                    try {
                      const sitesData = await fetchSites();
                      const { updatedSites } = await fetchSiteContractors(sitesData);
                      console.log('Refreshed sites with contractors:', updatedSites);
                      setSites(updatedSites);
                      toast.success('Site assignments refreshed');
                    } catch (error) {
                      console.error('Error refreshing site data:', error);
                      toast.error('Failed to refresh site data');
                    } finally {
                      setIsLoading(false);
                    }
                  };
                  refreshData();
                }}
                size="sm"
              >
                Refresh Data
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Sites</CardTitle>
                <CardDescription>Select a site to view its assigned contractors</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center p-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                      <span className="ml-2">Loading sites...</span>
                    </div>
                  ) : sites.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No sites available
                    </div>
                  ) : (
                    <div className="divide-y">
                      {sites.map((site) => (
                        <div 
                          key={site.id}
                          className={`p-4 cursor-pointer ${
                            selectedSite?.id === site.id 
                              ? 'bg-[#7851CA]/10' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleSiteSelection(site)}
                        >
                          <div className="font-medium">{site.name}</div>
                          <div className="text-sm text-gray-500 mt-1">{site.address}</div>
                          <div className="text-xs text-gray-400 mt-1">
                            {site.assignedContractors?.length || 0} contractors assigned
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1 md:col-span-2">
              <CardHeader>
                <CardTitle>
                  {selectedSite 
                    ? `Contractors assigned to ${selectedSite.name}` 
                    : 'Select a site to view assigned contractors'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center p-6">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                    <span className="ml-2">Loading contractors...</span>
                  </div>
                ) : selectedSite ? (
                  selectedSite.assignedContractors && selectedSite.assignedContractors.length > 0 ? (
                    <div className="space-y-3">
                      {selectedSite.assignedContractors.map((contractor, idx) => (
                        <div key={idx} className="p-3 border rounded bg-white flex justify-between items-center">
                          <div className="font-medium">{contractor}</div>
                          {!viewOnly && (
                            <div className="flex space-x-2">
                              <button
                                className="text-red-500 text-sm hover:underline"
                                onClick={() => handleDeleteContractor(selectedSite, contractor)}
                              >
                                Remove
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      {!viewOnly && (
                        <div className="mt-4 p-3 border-t pt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenAssignDialog(selectedSite)}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Assign New Contractor
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-gray-500 mb-4">
                        No contractors assigned to this site
                      </div>
                      {!viewOnly && (
                        <Button 
                          size="sm" 
                          onClick={() => handleOpenAssignDialog(selectedSite)}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Assign Contractor
                        </Button>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select a site from the left to view assigned contractors
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="active-jobs">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Active Jobs with Assigned Contractors</h3>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-500">Status:</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Active Jobs</CardTitle>
                  <CardDescription>Jobs with status pending or in-progress</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loadingJobs ? (
                    <div className="flex justify-center items-center p-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                      <span className="ml-2">Loading jobs...</span>
                    </div>
                  ) : getFilteredJobs().length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No active jobs found
                    </div>
                  ) : (
                    <div className="divide-y max-h-[500px] overflow-y-auto">
                      {getFilteredJobs().map((job) => (
                        <div 
                          key={job.id}
                          className={`p-4 cursor-pointer ${
                            selectedJob?.id === job.id 
                              ? 'bg-[#7851CA]/10' 
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleJobSelection(job)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="font-medium">{job.title}</div>
                            <Badge className={`${getPriorityBadge(job.priority)}`}>
                              {job.priority ? job.priority.charAt(0).toUpperCase() + job.priority.slice(1) : 'Normal'}
                            </Badge>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-2">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{job.sites?.name || 'Unknown Site'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>Due: {formatDate(job.due_date)}</span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <Badge className={job.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}>
                              {job.status === 'pending' ? 'Pending' : 'In Progress'}
                            </Badge>
                            {job.contractor_id ? (
                              <Badge variant="outline" className="text-[#7851CA] border-[#7851CA]">
                                <User className="h-3 w-3 mr-1" />
                                Assigned
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-gray-500">
                                <CircleAlert className="h-3 w-3 mr-1" />
                                Unassigned
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    {selectedJob 
                      ? `Contractor Details - ${selectedJob.title}` 
                      : 'Select a job to view assigned contractor'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingJobs ? (
                    <div className="flex justify-center items-center p-6">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                      <span className="ml-2">Loading contractor details...</span>
                    </div>
                  ) : selectedJob ? (
                    selectedJob.contractor_id && jobContractors[selectedJob.contractor_id] ? (
                      <div>
                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">Job Details</h4>
                              <div className="space-y-2">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">Due: {formatDate(selectedJob.due_date)}</span>
                                </div>
                                <div className="flex items-center">
                                  <Wrench className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">Service: {selectedJob.service_type || 'Not specified'}</span>
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="h-4 w-4 text-gray-500 mr-2" />
                                  <span className="text-sm">Site: {selectedJob.sites?.name || 'Unknown'}</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-gray-500 mb-1">Assigned Contractor</h4>
                              <div className="p-3 bg-white rounded-md border">
                                <div className="font-medium text-lg">{jobContractors[selectedJob.contractor_id].name}</div>
                                <div className="space-y-2 mt-2">
                                  <div className="flex items-center text-sm">
                                    <Mail className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{jobContractors[selectedJob.contractor_id].contact_email}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Phone className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{jobContractors[selectedJob.contractor_id].contact_phone}</span>
                                  </div>
                                  <div className="flex items-center text-sm">
                                    <Wrench className="h-4 w-4 text-gray-500 mr-2" />
                                    <span>{jobContractors[selectedJob.contractor_id].service_type}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedJob.description && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Job Description</h4>
                            <div className="p-3 bg-gray-50 rounded text-sm">
                              {selectedJob.description}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <CircleAlert className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-1">No Contractor Assigned</h3>
                        <p>This job currently doesn't have an assigned contractor.</p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Wrench className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-1">Select a Job</h3>
                      <p>Select a job from the list to view the assigned contractor's details.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {!viewOnly && (
        <AssignmentDialog
          open={assignDialogOpen}
          onOpenChange={setAssignDialogOpen}
          sites={sites}
          contractors={contractors}
          selectedSite={selectedSiteForEdit}
          selectedContractor={selectedContractor}
          onSiteChange={handleSiteChange}
          onContractorChange={handleContractorChange}
          onSubmit={handleAssignContractor}
          isLoading={isSubmitting}
          isEditing={isEditing}
        />
      )}
    </div>
  );
};

export default ContractorAssignments;
