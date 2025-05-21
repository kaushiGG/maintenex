import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Sliders,
  FileDown,
  Eye,
  Download,
  Share2,
  X,
  Loader2
} from 'lucide-react';
import { completionReports } from '../mockData';
import CompletedJobReportView from './CompletedJobReportView';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Define interfaces for the job data
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
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  completion_time: string | null;
  sites?: Site;
}

const ServiceCompletionTab: React.FC = () => {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [siteFilter, setSiteFilter] = useState('all');
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [sites, setSites] = useState<{id: string, name: string}[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    fetchCompletedJobs();
  }, [serviceTypeFilter, siteFilter]);

  const fetchCompletedJobs = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Build our query
      let query = supabase
        .from('jobs')
        .select(`
          *,
          sites:site_id(id, name, address)
        `)
        .or('status.eq.completed,status.ilike.%completed%')
        .order('updated_at', { ascending: false });
      
      // Apply filters if needed
      if (serviceTypeFilter !== 'all') {
        query = query.eq('service_type', serviceTypeFilter);
      }
      
      if (siteFilter !== 'all') {
        query = query.eq('site_id', siteFilter);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching completed jobs:', error);
        toast.error('Failed to load completed jobs');
        setCompletedJobs([]);
      } else {
        console.log('Completed jobs:', data);
        setCompletedJobs(data || []);
        
        // Extract unique service types and sites for filters
        const uniqueServiceTypes = [...new Set(data?.map(job => job.service_type) || [])];
        setServiceTypes(uniqueServiceTypes);
        
        const uniqueSites = [...new Set(data?.map(job => job.sites) || [])]
          .filter(Boolean)
          .map(site => ({
            id: site?.id || '',
            name: site?.name || 'Unknown Site'
          }));
        setSites(uniqueSites);
      }
    } catch (err) {
      console.error('Exception fetching completed jobs:', err);
      toast.error('An error occurred while loading jobs');
      setCompletedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = (reportId: string | number) => {
    setSelectedJobId(String(reportId));
    setIsReportOpen(true);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate completion metrics
  const calculateCompletionRate = (serviceType?: string) => {
    if (!completedJobs.length) return '0%';
    
    if (serviceType) {
      const jobsOfType = completedJobs.filter(job => job.service_type === serviceType);
      if (!jobsOfType.length) return '0%';
      return '100%'; // All jobs in completedJobs are completed
    }
    
    return '100%';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Service Completion Reports</CardTitle>
          <CardDescription>
            View and generate reports for completed service work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-4">
              <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Service Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Service Types</SelectItem>
                  {serviceTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={siteFilter} onValueChange={setSiteFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sites</SelectItem>
                  {sites.map(site => (
                    <SelectItem key={site.id} value={site.id}>
                      {site.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-x-2">
              <Button variant="outline" className="gap-1">
                <Sliders className="h-4 w-4" />
                Filter
              </Button>
              <Button className="gap-1">
                <FileDown className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden mb-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <div className="flex justify-center items-center">
                        <Loader2 className="h-6 w-6 animate-spin text-gray-400 mr-2" />
                        <span>Loading completed jobs...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : completedJobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-10">
                      <p className="text-gray-500">No completed jobs found.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  completedJobs.map(job => (
                    <TableRow key={job.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewReport(job.id)}>
                      <TableCell className="font-medium">{job.title || `${job.service_type} Job`}</TableCell>
                      <TableCell>{formatDate(job.completion_time || job.updated_at)}</TableCell>
                      <TableCell>{job.sites?.name || 'Unknown Site'}</TableCell>
                      <TableCell>
                        <Badge 
                          className="bg-green-100 text-green-800 hover:bg-green-100"
                        >
                          Completed
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => {
                          e.stopPropagation();
                          handleViewReport(job.id);
                        }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Service Completion Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {serviceTypes.slice(0, 5).map(type => (
                    <div key={type} className="flex justify-between items-center">
                      <span>{type}</span>
                      <span className="text-green-600">
                        {calculateCompletionRate(type)}
                      </span>
                    </div>
                  ))}
                  {serviceTypes.length === 0 && (
                    <div className="text-center py-2 text-gray-500">
                      No service data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Generate Combined Report</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">
                    Create a comprehensive report combining multiple service completions
                    for submission to management or regulatory bodies.
                  </p>
                  <div className="space-y-2">
                    {serviceTypes.slice(0, 3).map(type => (
                      <div key={type} className="flex items-center space-x-2">
                        <Switch id={`include-${type.toLowerCase().replace(/\s+/g, '-')}`} />
                        <label htmlFor={`include-${type.toLowerCase().replace(/\s+/g, '-')}`}>
                          Include {type}
                        </label>
                      </div>
                    ))}
                    {serviceTypes.length === 0 && (
                      <div className="text-center py-2 text-gray-500">
                        No services available for reporting
                      </div>
                    )}
                  </div>
                  <Button className="w-full gap-2" disabled={serviceTypes.length === 0}>
                    <FileDown className="h-4 w-4" />
                    Generate Combined Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Completed Job Report</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <DialogDescription>
              Detailed information about the completed service
            </DialogDescription>
          </DialogHeader>
          
          <CompletedJobReportView jobId={selectedJobId} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCompletionTab;
