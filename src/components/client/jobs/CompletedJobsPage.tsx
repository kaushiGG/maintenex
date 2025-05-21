import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Filter, Download, Calendar, FileDown, Search, FileText, ArrowUpDown } from 'lucide-react';
import { Job } from '@/types/job';
import { Badge } from '@/components/ui/badge';

// Sample job data
const sampleJobs: Job[] = [
  {
    id: 'job123',
    title: 'Electrical Inspection',
    description: 'Complete electrical system inspection for office building',
    status: 'completed',
    priority: 'medium',
    site_id: 'site1',
    service_type: 'electrical',
    created_at: '2023-04-10T10:00:00Z',
    start_time: '2023-04-15T09:00:00Z',
    completion_time: '2023-04-15T12:00:00Z',
    assigned_to: 'contractor1',
    progress: 100,
    location_details: 'Main building, floor 2',
    updated_at: '2023-04-15T12:30:00Z',
    start_date: '2023-04-15'
  },
  {
    id: 'job124',
    title: 'Plumbing Repair',
    description: 'Fix leaking pipe in kitchen area',
    status: 'completed',
    priority: 'high',
    site_id: 'site2',
    service_type: 'plumbing',
    created_at: '2023-04-12T14:00:00Z',
    start_time: '2023-04-16T10:00:00Z',
    completion_time: '2023-04-16T15:00:00Z',
    assigned_to: 'contractor2',
    progress: 100,
    location_details: 'Kitchen, ground floor',
    updated_at: '2023-04-16T15:30:00Z',
    start_date: '2023-04-16'
  }
];

const CompletedJobsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [jobs, setJobs] = useState<Job[]>([]);
  const navigate = useNavigate();

  // Fetch completed jobs on component mount
  useEffect(() => {
    // In a real app, you would fetch from API
    setJobs(sampleJobs);
  }, []);

  // Filter jobs based on search term, tab, and date
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.description && job.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTab = selectedTab === 'all' || job.service_type === selectedTab;
    
    return matchesSearch && matchesTab;
  });

  const handleViewJobDetails = (jobId: string) => {
    navigate(`/jobs/details/${jobId}`);
  };

  const handleDownloadReport = (jobId: string) => {
    console.log('Downloading report for job:', jobId);
    // In a real app, this would download the report
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Completed Jobs</h1>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button>
            <FileDown className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="Search by job title, ID or description..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="week">Last week</SelectItem>
              <SelectItem value="month">Last month</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            More Filters
          </Button>
        </div>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="electrical">Electrical</TabsTrigger>
          <TabsTrigger value="plumbing">Plumbing</TabsTrigger>
          <TabsTrigger value="hvac">HVAC</TabsTrigger>
          <TabsTrigger value="fire_safety">Fire Safety</TabsTrigger>
        </TabsList>
        
        <TabsContent value={selectedTab}>
          <div className="bg-white rounded-md shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Job ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Service Type</TableHead>
                  <TableHead>Completion Date</TableHead>
                  <TableHead>Site</TableHead>
                  <TableHead>Contractor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredJobs.length > 0 ? (
                  filteredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-mono text-sm">{job.id}</TableCell>
                      <TableCell className="font-medium">{job.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {job.service_type}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(job.completion_time || '').toLocaleDateString()}</TableCell>
                      <TableCell>Site Name</TableCell>
                      <TableCell>{job.assigned_to || 'Not assigned'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                      No completed jobs found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompletedJobsPage;
