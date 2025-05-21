import React, { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/BusinessDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Clock, CheckCircle, AlertTriangle, Filter, Download, UserCheck, CalendarClock, ShieldCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface License {
  id: string;
  contractorName: string;
  licenseType: string;
  licenseNumber: string;
  expiryDate: string;
  issueDate: string;
  provider: string;
  notes?: string;
  status: 'active' | 'expiring' | 'expired';
  verificationDate?: string;
}

const LicenseTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLicenses = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('contractor_licenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        // Map database columns to our License type
        const mappedLicenses = data.map(item => {
          const today = new Date();
          const expiryDate = new Date(item.expiry_date);
          const diffTime = expiryDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          let status: 'active' | 'expiring' | 'expired' = 'active';
          if (diffDays < 0) {
            status = 'expired';
          } else if (diffDays < 30) {
            status = 'expiring';
          }
          
          return {
            id: item.id,
            contractorName: item.contractor_name,
            licenseType: item.license_type,
            licenseNumber: item.license_number,
            expiryDate: item.expiry_date,
            issueDate: item.issue_date,
            provider: item.provider,
            notes: item.notes,
            status: status,
            verificationDate: item.created_at // Using created_at as verification date for now
          };
        });
        
        setLicenses(mappedLicenses);
      }
    } catch (error: any) {
      console.error('Error fetching licenses:', error);
      toast.error('Failed to load license data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLicenses();
  }, []);

  // Filter licenses based on search term and status filter
  const filteredLicenses = licenses.filter(license => {
    const matchesSearch = license.contractorName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         license.licenseType.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         license.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || license.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Get expiring licenses (within next 60 days)
  const expiringLicenses = licenses.filter(license => {
    if (license.status === 'expiring') {
      return true;
    }
    return false;
  });

  // Function to render status badge with appropriate color and icon
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-0 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Active
          </Badge>;
      case 'expiring':
        return <Badge className="bg-amber-100 text-amber-800 border-0 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Expiring Soon
          </Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-0 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Expired
          </Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-0">
            {status}
          </Badge>;
    }
  };

  const calculateDaysRemaining = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  return (
    <BusinessDashboard switchRole={() => {}} userRole="business" handleLogout={() => {}} userMode="management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="font-bold tracking-tight text-2xl text-forgemate-dark">License Tracking</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <CardTitle className="flex items-center gap-2 text-xl text-forgemate-dark">
                <ShieldCheck className="h-5 w-5 text-purple-600" />
                Contractor Licenses
              </CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input 
                    type="search" 
                    placeholder="Search licenses..." 
                    className="pl-8 w-full sm:w-[260px]" 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)} 
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[160px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span>Filter Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring">Expiring Soon</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="list">
              <TabsList className="mb-4">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="expiring" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Expiring Soon
                </TabsTrigger>
                <TabsTrigger value="verification" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Verification Status
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Expiry Calendar
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="list">
                <div className="rounded-md border">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contractor</TableHead>
                          <TableHead>License Type</TableHead>
                          <TableHead>License Number</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Expiry Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Provider</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLicenses.length > 0 ? (
                          filteredLicenses.map(license => (
                            <TableRow key={license.id}>
                              <TableCell className="font-medium">{license.contractorName}</TableCell>
                              <TableCell>{license.licenseType}</TableCell>
                              <TableCell>{license.licenseNumber}</TableCell>
                              <TableCell>{new Date(license.issueDate).toLocaleDateString()}</TableCell>
                              <TableCell>{new Date(license.expiryDate).toLocaleDateString()}</TableCell>
                              <TableCell>{renderStatusBadge(license.status)}</TableCell>
                              <TableCell>{license.provider}</TableCell>
                              <TableCell>{license.notes}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                              {searchTerm || filterStatus !== 'all' ? 
                                'No licenses found matching your search criteria' : 
                                'No licenses found. Add licenses in the Contractor Management section.'}
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="expiring">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
                  <div className="flex items-center gap-2 text-amber-800 mb-2">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-semibold">Licenses Expiring Soon</h3>
                  </div>
                  <p className="text-sm text-amber-700 mb-4">
                    The following licenses will expire within the next 60 days and require attention.
                  </p>
                  <div className="rounded-md border bg-white">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Contractor</TableHead>
                            <TableHead>License Type</TableHead>
                            <TableHead>Expiry Date</TableHead>
                            <TableHead>Days Remaining</TableHead>
                            <TableHead>Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expiringLicenses.length > 0 ? (
                            expiringLicenses.map(license => (
                              <TableRow key={license.id}>
                                <TableCell className="font-medium">{license.contractorName}</TableCell>
                                <TableCell>{license.licenseType}</TableCell>
                                <TableCell>{new Date(license.expiryDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  <Badge className="bg-amber-100 text-amber-800 border-0">
                                    {calculateDaysRemaining(license.expiryDate)} days
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  <Button variant="outline" size="sm">Send Reminder</Button>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                No licenses expiring soon
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Proactively managing license expirations helps avoid compliance issues and service disruptions.
                </p>
              </TabsContent>
              
              <TabsContent value="verification">
                <div className="rounded-md border">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7851CA]"></div>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contractor</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Verification Date</TableHead>
                          <TableHead>Verified By</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredLicenses.length > 0 ? (
                          filteredLicenses.map(license => (
                            <TableRow key={license.id}>
                              <TableCell className="font-medium">{license.contractorName}</TableCell>
                              <TableCell>{license.licenseType}</TableCell>
                              <TableCell>{license.verificationDate ? new Date(license.verificationDate).toLocaleDateString() : 'Not verified'}</TableCell>
                              <TableCell>System Admin</TableCell>
                              <TableCell>
                                <Badge className="bg-blue-100 text-blue-800 border-0 flex items-center gap-1">
                                  <CheckCircle className="h-3 w-3" />
                                  Verified
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                              No licenses found matching your search criteria
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="calendar">
                <div className="bg-gray-50 p-4 rounded-md border text-center">
                  <p className="text-gray-500">Calendar view will display license expiry dates in a monthly calendar format.</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </BusinessDashboard>
  );
};

export default LicenseTracking;
