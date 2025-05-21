import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Mail, Phone, Briefcase, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

// Interface for site data
interface Site {
  id: string;
  name: string;
  address?: string;
}

// Interface for contractor assignment data
interface ContractorAssignment {
  contractor_name: string;
  contractor_email: string;
  contractor_phone: string;
  job_title: string;
  site_name: string;
  job_id: string;
  job_status: string;
  service_type?: string;
}

const SiteContractorDetails: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [assignments, setAssignments] = useState<ContractorAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [siteLoading, setSiteLoading] = useState<boolean>(true);

  // Fetch all sites for the dropdown
  useEffect(() => {
    const fetchSites = async () => {
      setSiteLoading(true);
      try {
        const { data, error } = await supabase
          .from('business_sites')
          .select('id, name, address')
          .order('name');
        
        if (error) throw error;
        setSites(data || []);
      } catch (error) {
        console.error('Error fetching sites:', error);
      } finally {
        setSiteLoading(false);
      }
    };

    fetchSites();
  }, []);

  // Fetch contractor assignments for selected site
  useEffect(() => {
    if (!selectedSiteId) {
      setAssignments([]);
      setLoading(false);
      return;
    }

    const fetchAssignments = async () => {
      setLoading(true);
      try {
        // This query is based on the SQL provided:
        // select c.name, c.contact_email, c.contact_phone, j.title, b.name 
        // from jobs j, contractors c, business_sites b 
        // where j.site_id = b.id and c.id = j.contractor_id and b.id= '1d64f7b9-7795-46aa-8ca6-4bb3a659a10a'
        
        const { data, error } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            status,
            service_type,
            contractors:contractor_id (
              name,
              contact_email,
              contact_phone
            ),
            business_sites:site_id (
              id,
              name
            )
          `)
          .eq('site_id', selectedSiteId);
        
        if (error) throw error;
        
        // Transform the data for our UI
        const formattedData: ContractorAssignment[] = (data || [])
          .filter(job => job.contractors) // Only include jobs with assigned contractors
          .map(job => ({
            contractor_name: job.contractors?.name || 'Unassigned',
            contractor_email: job.contractors?.contact_email || '-',
            contractor_phone: job.contractors?.contact_phone || '-',
            job_title: job.title || 'Untitled Job',
            site_name: job.business_sites?.name || 'Unknown Site',
            job_id: job.id,
            job_status: job.status || 'unknown',
            service_type: job.service_type || 'General Maintenance'
          }));
        
        setAssignments(formattedData);
      } catch (error) {
        console.error('Error fetching contractor assignments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [selectedSiteId]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
      case 'in progress':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Contractor Assignments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Site
          </label>
          
          {siteLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={selectedSiteId}
              onValueChange={setSelectedSiteId}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a site to view assigned contractors" />
              </SelectTrigger>
              <SelectContent>
                {sites.map(site => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {!selectedSiteId ? (
          <div className="text-center p-8 text-gray-500">
            Please select a site to view contractor assignments
          </div>
        ) : loading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center p-8 text-gray-500">
            No contractors are currently assigned to this site
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contractor</TableHead>
                  <TableHead>Contact Details</TableHead>
                  <TableHead>Job / Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assignments.map((assignment, index) => (
                  <TableRow key={`${assignment.job_id}-${index}`}>
                    <TableCell>
                      <div className="flex items-start space-x-2">
                        <User className="h-5 w-5 text-forgemate-purple mt-0.5" />
                        <div>
                          <div className="font-medium">{assignment.contractor_name}</div>
                          <div className="text-sm text-gray-500">{assignment.service_type}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">{assignment.contractor_email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm">{assignment.contractor_phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start space-x-2">
                        <Briefcase className="h-5 w-5 text-forgemate-purple mt-0.5" />
                        <div>
                          <div className="font-medium">{assignment.job_title}</div>
                          <div className="text-sm text-gray-500">
                            <span className="inline-flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {assignment.site_name}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(assignment.job_status)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteContractorDetails; 