import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractorDashboard from '@/components/ContractorDashboard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, FileText, X, Loader2, Calendar, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Site {
  id: string;
  name: string;
  address: string;
}

interface Job {
  id: string;
  title: string;
  service_type: string;
  status: string;
  contractor_id: string | null;
  created_at: string;
  updated_at: string;
  completion_time: string | null;
  sites?: Site;
  description?: string;
}

const ContractorCompletedJobs = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, [user]);

  const fetchCompletedJobs = async () => {
    if (!user) {
      console.log("No user found, cannot fetch jobs");
      setLoading(false);
      return;
    }

    console.log("Current user ID:", user.id);
    setLoading(true);
    try {
      // Get contractor information for debugging
      console.log("Fetching all contractor data to debug...");
      const { data: allContractors, error: allContractorsError } = await supabase
        .from('contractors')
        .select('*');
      
      if (allContractorsError) {
        console.error('Error fetching all contractors:', allContractorsError);
      } else {
        console.log('All contractors in the system:', allContractors);
      }
      
      // First, check if user_id is used instead of owner_id
      let contractorId = null;
      
      // Try with owner_id
      const { data: contractorDataOwner, error: contractorErrorOwner } = await supabase
        .from('contractors')
        .select('*')
        .eq('owner_id', user.id);
      
      if (contractorErrorOwner) {
        console.error('Error fetching contractor by owner_id:', contractorErrorOwner);
      } else if (contractorDataOwner && contractorDataOwner.length > 0) {
        console.log('Found contractor by owner_id:', contractorDataOwner);
        contractorId = contractorDataOwner[0].id;
      } else {
        console.log('No contractor found with owner_id:', user.id);
        
        // Try with user_id
        const { data: contractorDataUser, error: contractorErrorUser } = await supabase
          .from('contractors')
          .select('*')
          .eq('user_id', user.id);
        
        if (contractorErrorUser) {
          console.error('Error fetching contractor by user_id:', contractorErrorUser);
        } else if (contractorDataUser && contractorDataUser.length > 0) {
          console.log('Found contractor by user_id:', contractorDataUser);
          contractorId = contractorDataUser[0].id;
        } else {
          console.log('No contractor found with user_id:', user.id);
          
          // Try with auth_id
          const { data: contractorDataAuth, error: contractorErrorAuth } = await supabase
            .from('contractors')
            .select('*')
            .eq('auth_id', user.id);
          
          if (contractorErrorAuth) {
            console.error('Error fetching contractor by auth_id:', contractorErrorAuth);
          } else if (contractorDataAuth && contractorDataAuth.length > 0) {
            console.log('Found contractor by auth_id:', contractorDataAuth);
            contractorId = contractorDataAuth[0].id;
          } else {
            console.log('No contractor found with auth_id:', user.id);
          }
        }
      }

      if (!contractorId) {
        console.log('Could not find contractor ID with any known field. For testing, fetching all completed jobs...');
        // For testing purposes, show all completed jobs
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(id, name, address)
          `)
          .or('status.eq.completed,status.ilike.%completed%')
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching all completed jobs:', error);
          toast.error('Failed to load completed jobs');
          setCompletedJobs([]);
        } else {
          console.log('All completed jobs for testing:', data);
          
          if (data && data.length === 0) {
            toast.info('No completed jobs found in the system.');
          } else {
            toast.warning('Showing all completed jobs because contractor profile not found.');
          }
          
          setCompletedJobs(data || []);
        }
      } else {
        console.log("Found contractor ID:", contractorId);
        
        // Now fetch jobs for this contractor
        console.log("Fetching completed jobs for contractor ID:", contractorId);
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(id, name, address)
          `)
          .or('status.eq.completed,status.ilike.%completed%')
          .eq('contractor_id', contractorId)
          .order('updated_at', { ascending: false });

        if (error) {
          console.error('Error fetching completed jobs:', error);
          toast.error('Failed to load completed jobs');
          setCompletedJobs([]);
        } else {
          console.log('Completed jobs data for contractor:', data);
          
          if (data && data.length === 0) {
            toast.info('No completed jobs found for your account.');
          }
          
          setCompletedJobs(data || []);
        }
      }
    } catch (err) {
      console.error('Exception fetching completed jobs:', err);
      toast.error('An error occurred while loading jobs');
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewJob = (job: Job) => {
    setSelectedJob(job);
    setIsReportOpen(true);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getServiceTypeBadge = (serviceType: string) => {
    const types: Record<string, string> = {
      'thermal imaging': 'bg-orange-100 text-orange-800',
      'electrical': 'bg-blue-100 text-blue-800',
      'plumbing': 'bg-cyan-100 text-cyan-800',
      'test & tag': 'bg-purple-100 text-purple-800',
      'hvac': 'bg-teal-100 text-teal-800',
      'fire safety': 'bg-red-100 text-red-800'
    };
    
    return types[serviceType?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const filteredJobs = completedJobs.filter(job => 
    !searchTerm || 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.service_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.sites?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.sites?.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const content = (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">My Completed Jobs</CardTitle>
                <CardDescription>
                  View and access reports for jobs you have completed
                </CardDescription>
              </div>
              <div className="relative w-full md:w-64">
                <Input
                  placeholder="Search jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                {searchTerm && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-pretance-purple mr-2" />
                <span>Loading completed jobs...</span>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16">
                <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No completed jobs found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  {searchTerm 
                    ? "No jobs match your search criteria. Try adjusting your search terms."
                    : "You don't have any completed jobs assigned to your account yet. Jobs will appear here once they are completed."
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-hidden border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Name</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Site</TableHead>
                      <TableHead>Completion Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobs.map(job => (
                      <TableRow key={job.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{job.title || 'Unnamed Job'}</TableCell>
                        <TableCell>
                          <Badge className={getServiceTypeBadge(job.service_type)}>
                            {job.service_type || 'General'}
                          </Badge>
                        </TableCell>
                        <TableCell>{job.sites?.name || 'Unknown Site'}</TableCell>
                        <TableCell>{formatDate(job.completion_time || job.updated_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {filteredJobs.length > 0 && (
              <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                <span>Showing {filteredJobs.length} jobs</span>
                {searchTerm && filteredJobs.length < completedJobs.length && (
                  <span>{filteredJobs.length} of {completedJobs.length} jobs match your search</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedJob && (
        <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-4">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl">{selectedJob.title || 'Job Report'}</DialogTitle>
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
              <DialogDescription>
                Completed {selectedJob.service_type} job at {selectedJob.sites?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Service Details</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Service Type:</span>
                      <Badge className={getServiceTypeBadge(selectedJob.service_type)}>
                        {selectedJob.service_type || 'General'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Completed On:</span>
                      <span className="text-sm font-medium">
                        {formatDate(selectedJob.completion_time || selectedJob.updated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge className="bg-green-100 text-green-800">Completed</Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Site Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Site Name:</span>
                      <span className="text-sm font-medium">{selectedJob.sites?.name || 'Unknown Site'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Address:</span>
                      <span className="text-sm font-medium">{selectedJob.sites?.address || 'No address provided'}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Job Description</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-sm">{selectedJob.description || 'No description provided for this job.'}</p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsReportOpen(false)}>
                  Close
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );

  return (
    <ContractorDashboard
      userRole="contractor"
      handleLogout={handleLogout}
    >
      {content}
    </ContractorDashboard>
  );
};

export default ContractorCompletedJobs; 