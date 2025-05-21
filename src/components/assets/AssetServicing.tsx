import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Asset } from '@/types/asset';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, Clock, Wrench, CheckCircle2, AlertCircle, CalendarDays, 
  Filter, Download, Search, Plus, ChevronDown, User, FileText,
  X, Loader2, History, AlertTriangle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import ScheduleServiceDialog from './ScheduleServiceDialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AssetServicingProps {
  asset: Asset;
  type: 'history' | 'schedule';
}

// Define interfaces for our service data
interface ServiceHistory {
  id: string;
  date: string;
  technician: string;
  description: string;
  status: string;
  notes: string;
  equipment_id?: string;
}

interface ScheduledService {
  id: string;
  service_date: string;
  description: string;
  assigned_to: string;
  priority: string;
  status: string;
  equipment_id?: string;
  service_type: string;
}

// More flexible job data interface
interface JobData {
  id: string;
  created_at?: string;
  assigned_to?: string;
  service_type?: string;
  status?: string;
  assignment_notes?: string;
  equipment_id?: string;
  // Add other possible properties that might be needed
  [key: string]: any; 
}

const AssetServicing = ({ asset, type }: AssetServicingProps) => {
  const [filterOpen, setFilterOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [scheduledServices, setScheduledServices] = useState<ScheduledService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (asset?.id) {
      fetchServiceData();
    }
  }, [asset, type]);

  const fetchServiceData = async () => {
    setIsLoading(true);
    try {
      if (type === 'history') {
        // Fetch completed services from jobs table instead of scheduled_services
        const { data, error } = await supabase
          .from('jobs')
          .select('*')
          .eq('equipment_id', asset.id)
          .order('created_at', { ascending: false }) as any;

        if (error) {
          console.error('Error fetching service history from jobs:', error);
          toast.error('Failed to load service history');
          return;
        }

        // Map the data to our ServiceHistory interface
        const historyData: ServiceHistory[] = [];
        
        // Process each job and format the date
        if (data) {
          for (const job of data) {
            // Format date to show only the date portion (YYYY-MM-DD)
            let dateOnly = 'Unknown date';
            if (job.created_at) {
              try {
                const date = new Date(job.created_at);
                dateOnly = date.toISOString().split('T')[0];
              } catch (e) {
                console.error('Error formatting date:', e);
              }
            }
            
            historyData.push({
              id: job.id,
              date: dateOnly,
              technician: job.assigned_to || 'Unassigned',
              description: job.service_type || 'General Service',
              status: job.status || 'completed',
              notes: job.assignment_notes || ''
            });
          }
        }

        setServiceHistory(historyData);
      } else {
        // Fetch scheduled services that are not completed
        const { data: scheduledServicesData, error: scheduledServicesError } = await supabase
          .from('scheduled_services')
          .select('*')
          .eq('equipment_id', asset.id)
          .neq('status', 'completed')
          .order('service_date', { ascending: true });

        if (scheduledServicesError) {
          console.error('Error fetching scheduled services:', scheduledServicesError);
          toast.error('Failed to load scheduled services');
          return;
        }

        setScheduledServices(scheduledServicesData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred while loading service data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleService = () => {
    setIsScheduleDialogOpen(true);
  };

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'destructive';
      case 'normal':
        return 'default';
      case 'low':
        return 'outline';
      default:
        return 'default';
    }
  };

  const handleServiceComplete = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from('scheduled_services')
        .update({ status: 'completed' })
        .eq('id', serviceId);

      if (error) {
        console.error('Error completing service:', error);
        toast.error('Failed to mark service as completed');
        return;
      }

      toast.success('Service marked as completed');
      fetchServiceData(); // Refresh the data
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-lg font-semibold">
          {type === 'history' ? 'Service History' : 'Service Schedule'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {type === 'history' 
            ? `View maintenance and service records for ${asset.name}`
            : `View and manage upcoming services for ${asset.name}`
          }
        </p>
      </div>

      {type === 'history' ? (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <Clock className="h-4 w-4 text-primary mr-2" />
                  Maintenance Records
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setFilterOpen(!filterOpen)}>
                    <Filter className="h-3.5 w-3.5 mr-1" />
                    Filter
                    <ChevronDown className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filterOpen && (
                <div className="mb-4 p-3 border rounded-md bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs mb-1 block text-muted-foreground">Date Range</label>
                      <Input placeholder="From - To" size={1} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block text-muted-foreground">Technician</label>
                      <Input placeholder="Any technician" size={1} className="text-sm" />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block text-muted-foreground">Service Type</label>
                      <Input placeholder="Any type" size={1} className="text-sm" />
                    </div>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {serviceHistory.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead>Date</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Technician</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {serviceHistory.map((service, index) => (
                            <TableRow key={service.id} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                                  {service.date}
                                </div>
                              </TableCell>
                              <TableCell>{service.description}</TableCell>
                              <TableCell>
                                <div className="flex items-center">
                                  <User className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                                  {service.technician}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  {service.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <FileText className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md">
                      <History className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No service history available</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <Wrench className="h-4 w-4 text-primary mr-2" />
                Service Notes
              </CardTitle>
              <CardDescription>
                Additional details about past maintenance work
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              {serviceHistory.length > 0 ? (
                <div className="space-y-4">
                  {serviceHistory.map(service => (
                    <div key={service.id} className="p-3 border rounded-md bg-muted/10">
                      <div className="flex justify-between mb-2">
                        <div className="font-medium text-sm">{service.description}</div>
                        <div className="text-xs text-muted-foreground">{service.date}</div>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.notes}</p>
                      <div className="mt-2 text-xs text-primary">By {service.technician}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No service notes available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md flex items-center">
                  <CalendarDays className="h-4 w-4 text-primary mr-2" />
                  Service Schedule
                </CardTitle>
                <Button onClick={handleScheduleService} className="bg-primary hover:bg-primary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {asset.nextServiceDate && (
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Next service: {asset.nextServiceDate}</span>
                  </div>
                </div>
              )}
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  {scheduledServices.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40">
                            <TableHead>Date</TableHead>
                            <TableHead>Service Type</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {scheduledServices.map((service, index) => (
                            <TableRow key={service.id} className={index % 2 === 0 ? 'bg-muted/10' : ''}>
                              <TableCell>
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                                  {service.service_date}
                                </div>
                              </TableCell>
                              <TableCell>{service.service_type}</TableCell>
                              <TableCell>{service.assigned_to}</TableCell>
                              <TableCell>
                                <Badge variant={getPriorityBadgeVariant(service.priority)} className="capitalize">
                                  {service.priority === 'high' && <AlertTriangle className="h-3 w-3 mr-1" />}
                                  {service.priority}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleServiceComplete(service.id)}
                                    className="h-8"
                                  >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    Complete
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0"
                                  >
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-md">
                      <CalendarDays className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No scheduled services</p>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center">
                <Wrench className="h-4 w-4 text-primary mr-2" />
                Recommended Maintenance
              </CardTitle>
              <CardDescription>
                Suggested maintenance based on asset type and usage
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="font-medium text-sm mb-1">Quarterly Inspection</div>
                  <p className="text-sm text-muted-foreground">
                    Regular inspection of all components and connections
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Recommended every 3 months</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={handleScheduleService}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
                
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="font-medium text-sm mb-1">Full Calibration</div>
                  <p className="text-sm text-muted-foreground">
                    Complete calibration to ensure accurate operation
                  </p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Recommended yearly</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-7 text-xs"
                      onClick={handleScheduleService}
                    >
                      Schedule
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <ScheduleServiceDialog 
        asset={asset}
        isOpen={isScheduleDialogOpen}
        onClose={() => {
          setIsScheduleDialogOpen(false);
          fetchServiceData(); // Refresh data when dialog is closed
        }}
      />
    </div>
  );
};

export default AssetServicing;
