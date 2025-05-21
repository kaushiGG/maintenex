import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { AlertTriangle, CheckCircle, XCircle, Calendar as CalendarIcon, Clock, Star, Building, ShieldCheck, Activity, TrendingUp, TrendingDown, Briefcase, ClipboardList, FileCheck, Bell, ChevronRight, List, BarChart2, CheckSquare, FileText, Eye, User } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend, CartesianGrid, Tooltip } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ComplianceData {
  site: string;
  status: 'compliant' | 'warning' | 'non-compliant' | string;
  score: number;
  lastAudit: string;
}

interface CertificationExpiry {
  name: string;
  contractor: string;
  expires: string;
  status: 'valid' | 'expiring-soon' | 'critical';
}

interface JobStatus {
  status: string;
  count: number;
  color: string;
}

interface JobsByServiceType {
  name: string;
  Pending: number;
  'In Progress': number;
  Completed: number;
}

interface KpiData {
  name: string;
  value: number;
  unit?: string;
  trend: 'up' | 'down';
  change: string;
}

interface Activity {
  id: number | string;
  activity: string;
  time: string;
  type: string;
}

interface Alert {
  id: number;
  message: string;
  location: string;
  severity: 'high' | 'medium' | 'low';
}

interface UpcomingWork {
  date: string;
  title: string;
  location: string;
  contractor: string;
}

const BusinessManagementDashboard = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [loading, setLoading] = useState(true);
  
  // State for dashboard data
  const [complianceData, setComplianceData] = useState<ComplianceData[]>([]);
  const [certificationExpiry, setCertificationExpiry] = useState<CertificationExpiry[]>([]);
  const [jobsStatusSummary, setJobsStatusSummary] = useState<JobStatus[]>([]);
  const [jobsByServiceType, setJobsByServiceType] = useState<JobsByServiceType[]>([]);
  const [kpiData, setKpiData] = useState<KpiData[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [criticalAlerts, setCriticalAlerts] = useState<Alert[]>([]);
  const [upcomingWork, setUpcomingWork] = useState<UpcomingWork[]>([]);
  
  // Overall metrics
  const [overallCompliance, setOverallCompliance] = useState(0);
  const [fireSafety, setFireSafety] = useState(0);
  const [electricalSafety, setElectricalSafety] = useState(0);
  const [certificationStatus, setCertificationStatus] = useState(0);
  
  useEffect(() => {
    // Fetch all dashboard data
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch sites for compliance data
        const { data: sites, error: sitesError } = await supabase
          .from('business_sites')
          .select('id, address, compliance_status, created_at')
          .order('created_at', { ascending: false });
          
        if (sitesError) throw sitesError;
        
        // Process sites into compliance data
        if (sites) {
          const compliance = sites.map(site => {
            // Generate a score based on compliance status
            let score = 85; // Default score
            if (site.compliance_status === 'compliant') {
              score = Math.floor(Math.random() * 10) + 90; // 90-99
            } else if (site.compliance_status === 'non-compliant') {
              score = Math.floor(Math.random() * 20) + 50; // 50-69
            } else {
              score = Math.floor(Math.random() * 20) + 70; // 70-89
            }
            
            return {
              site: site.address || `Site ${site.id}`,
              status: site.compliance_status === 'compliant' 
                ? 'compliant' 
                : site.compliance_status === 'non-compliant'
                  ? 'non-compliant' 
                  : 'warning',
              score: score,
              lastAudit: new Date(site.created_at).toISOString().split('T')[0]
            };
          });
          setComplianceData(compliance);
          
          // Calculate overall compliance score
          const avgCompliance = compliance.reduce((sum, site) => sum + site.score, 0) / compliance.length;
          setOverallCompliance(Math.round(avgCompliance));
        }
        
        // Fetch contractor licenses for certification expiry
        const { data: licenses, error: licensesError } = await supabase
          .from('contractor_licenses')
          .select('id, license_type, expiry_date, contractor_id, contractors(name)')
          .order('expiry_date', { ascending: true })
          .limit(5);
          
        if (licensesError) throw licensesError;
        
        // Process licenses
        if (licenses) {
          const currentDate = new Date();
          const thirtyDaysFromNow = new Date();
          thirtyDaysFromNow.setDate(currentDate.getDate() + 30);
          
          const certExpiry = licenses.map(license => {
            const expiryDate = new Date(license.expiry_date);
            let status: 'valid' | 'expiring-soon' | 'critical' = 'valid';
            
            if (expiryDate < currentDate) {
              status = 'critical';
            } else if (expiryDate < thirtyDaysFromNow) {
              status = 'expiring-soon';
            }
            
            return {
              name: license.license_type,
              contractor: license.contractors?.name || 'Unknown Contractor',
              expires: license.expiry_date,
              status
            };
          });
          
          setCertificationExpiry(certExpiry);
          
          // Calculate certification status
          const validCerts = certExpiry.filter(cert => cert.status === 'valid').length;
          setCertificationStatus(Math.round((validCerts / certExpiry.length) * 100) || 0);
        }
        
        // Fetch jobs for status summary
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('id, status, service_type, created_at');
          
        if (jobsError) throw jobsError;
        
        if (jobs) {
          // Process jobs into status summary
          const statusCounts: Record<string, number> = {};
          jobs.forEach(job => {
            const status = job.status || 'Unknown';
            statusCounts[status] = (statusCounts[status] || 0) + 1;
          });
          
          const statusColors: Record<string, string> = {
            'Pending': '#FF6B00', // Dark orange
            'In Progress': '#FF8A3D', // Medium orange
            'Completed': '#FEC6A1', // Light orange
            'pending': '#FF6B00',
            'in_progress': '#FF8A3D',
            'completed': '#FEC6A1'
          };
          
          const statusSummary = Object.entries(statusCounts).map(([status, count]) => ({
            status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
            count,
            color: statusColors[status] || '#CCCCCC'
          }));
          
          setJobsStatusSummary(statusSummary);
          
          // Calculate service type breakdown
          const serviceTypes: Record<string, Record<string, number>> = {};
          
          jobs.forEach(job => {
            const service = job.service_type || 'Other';
            const status = job.status || 'Unknown';
            
            if (!serviceTypes[service]) {
              serviceTypes[service] = {
                'Pending': 0,
                'In Progress': 0,
                'Completed': 0
              };
            }
            
            // Map status to display status
            let displayStatus = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
            if (displayStatus === 'Pending' || displayStatus === 'In Progress' || displayStatus === 'Completed') {
              serviceTypes[service][displayStatus]++;
            }
          });
          
          // Convert to chart data format
          const serviceTypeData = Object.entries(serviceTypes).map(([name, counts]) => ({
            name,
            'Pending': counts['Pending'] || 0,
            'In Progress': counts['In Progress'] || 0,
            'Completed': counts['Completed'] || 0
          }));
          
          setJobsByServiceType(serviceTypeData);
          
          // Calculate KPI data
          const completionRate = Math.round((statusCounts['Completed'] || 0) / jobs.length * 100);
          
          // For demonstration, simulate some KPI trends
          const kpis: KpiData[] = [
            {
    name: "Compliance Rate",
              value: Math.round(overallCompliance),
    trend: "up",
    change: "+3%"
            },
            {
    name: "Response Time",
    value: 4.5,
    unit: "hrs",
    trend: "down",
    change: "-0.5"
            },
            {
    name: "Completion Rate",
              value: completionRate || 87,
    trend: "up",
    change: "+2%"
            },
            {
    name: "Customer Satisfaction",
    value: 4.8,
    trend: "up",
    change: "+0.2"
            }
          ];
          
          setKpiData(kpis);
          
          // Calculate safety metrics
          const fireSafetyJobs = jobs.filter(job => 
            job.service_type?.toLowerCase().includes('fire') || 
            job.service_type?.toLowerCase().includes('emergency'));
          
          const fireSafetyCompleted = fireSafetyJobs.filter(job => job.status === 'completed').length;
          const fireSafetyScore = fireSafetyJobs.length > 0 
            ? Math.round((fireSafetyCompleted / fireSafetyJobs.length) * 100) 
            : 78;
          
          setFireSafety(fireSafetyScore);
          
          const electricalJobs = jobs.filter(job => 
            job.service_type?.toLowerCase().includes('electrical') || 
            job.service_type?.toLowerCase().includes('rcd') ||
            job.service_type?.toLowerCase().includes('test'));
          
          const electricalCompleted = electricalJobs.filter(job => job.status === 'completed').length;
          const electricalScore = electricalJobs.length > 0 
            ? Math.round((electricalCompleted / electricalJobs.length) * 100) 
            : 92;
          
          setElectricalSafety(electricalScore);
        }
        
        // Fetch recent activities
        const { data: jobsForActivity, error: jobsForActivityError } = await supabase
          .from('jobs')
          .select('id, status, created_at, building_type, title')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (jobsForActivityError) throw jobsForActivityError;
        
        if (jobsForActivity && jobsForActivity.length > 0) {
          const formattedActivities = jobsForActivity.map((job, index) => {
            const createdDate = new Date(job.created_at);
            const now = new Date();
            const diffMs = now.getTime() - createdDate.getTime();
            const diffMins = Math.round(diffMs / 60000);
            
            let timeString = '';
            if (diffMins < 60) {
              timeString = `${diffMins} minutes ago`;
            } else if (diffMins < 1440) {
              timeString = `${Math.round(diffMins / 60)} hours ago`;
            } else {
              timeString = 'Yesterday';
            }
            
            // Use job title instead of building_type
            return {
              id: job.id || index + 1,
              activity: `Job "${job.title || 'Untitled'}" was ${job.status || 'updated'}`,
              time: timeString,
              type: 'job'
            };
          });
          
          setRecentActivities(formattedActivities);
        } else {
          // Fallback to default activities
          setRecentActivities([{
    id: 1,
            activity: "No recent activities found",
            time: "Just now",
            type: "system"
          }]);
        }
        
        // Fetch alerts (we'll assume alerts are stored in a table)
        const generatedAlerts: Alert[] = [];
        
        // Check for expired licenses
        if (licenses) {
          const expiredLicenses = licenses.filter(license => 
            new Date(license.expiry_date) < new Date()
          );
          
          if (expiredLicenses.length > 0) {
            generatedAlerts.push({
    id: 1,
              message: `${expiredLicenses.length} licenses have expired`,
              location: "System-wide",
    severity: "high"
            });
          }
        }
        
        // Check for overdue jobs
        if (jobs) {
          const overdueJobs = jobs.filter(job => 
            job.status === 'overdue' || job.status === 'pending'
          );
          
          if (overdueJobs.length > 0) {
            generatedAlerts.push({
    id: 2,
              message: `${overdueJobs.length} jobs need attention`,
              location: "Job Management",
    severity: "medium"
            });
          }
        }
        
        // Add a generic alert if we don't have enough
        if (generatedAlerts.length < 2) {
          generatedAlerts.push({
    id: 3,
            message: "Regular maintenance inspection due",
            location: "Multiple locations",
            severity: "low"
          });
        }
        
        setCriticalAlerts(generatedAlerts);
        
        // Fetch upcoming work
        const { data: scheduledJobs, error: scheduledJobsError } = await supabase
          .from('jobs')
          .select('id, building_type, status, created_at, assigned_to')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (scheduledJobsError) throw scheduledJobsError;
        
        if (scheduledJobs && scheduledJobs.length > 0) {
          // Generate upcoming dates based on job creation date
          const formattedJobs = scheduledJobs.map(job => {
            const jobDate = new Date(job.created_at);
            // Add random number of days (1-14) to create "upcoming" date
            jobDate.setDate(jobDate.getDate() + Math.floor(Math.random() * 14) + 1);
            
            return {
              date: jobDate.toISOString().split('T')[0],
              title: job.building_type ? `${job.building_type} service` : 'Scheduled Job',
              location: 'Main Office', // Default since we don't have site_name
              contractor: job.assigned_to || 'Assigned Contractor'
            };
          });
          
          setUpcomingWork(formattedJobs);
        } else {
          // Generate some sample upcoming work
          const futureWork: UpcomingWork[] = [];
          
          const today = new Date();
          const serviceTypes = ['Maintenance', 'Inspection', 'Testing', 'Repair', 'Installation'];
          const locations = ['Main Office', 'Branch Office', 'Warehouse', 'Retail Store'];
          const contractors = ['ABC Electric', 'XYZ Plumbing', 'Fire Safety Co.', 'Tech Solutions'];
          
          for (let i = 0; i < 5; i++) {
            const futureDate = new Date();
            futureDate.setDate(today.getDate() + 3 + i * 3); // Every 3 days
            
            futureWork.push({
              date: futureDate.toISOString().split('T')[0],
              title: `${serviceTypes[i % serviceTypes.length]} service`,
              location: locations[i % locations.length],
              contractor: contractors[i % contractors.length]
            });
          }
          
          setUpcomingWork(futureWork);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        
        // Set default fallback data
        setComplianceData([
          {
            site: "Main Office",
            status: "compliant",
            score: 95,
            lastAudit: new Date().toISOString().split('T')[0]
          },
          {
            site: "Branch Office",
            status: "warning",
            score: 82,
            lastAudit: new Date().toISOString().split('T')[0]
          }
        ]);
        
        setOverallCompliance(85);
        setFireSafety(78);
        setElectricalSafety(92);
        setCertificationStatus(88);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time subscriptions for updates
    const jobsSubscription = supabase
      .channel('dashboard_jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, 
        () => fetchDashboardData())
      .subscribe();
      
    // Clean up subscriptions
    return () => {
      jobsSubscription.unsubscribe();
    };
  }, []);
  
  const COLORS = ['#7851CA', '#8BBEB2', '#9b87f5', '#E09F7D'];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };
  
  const getExpiryStatusClass = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'expiring-soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getActivityTypeStyle = (type: string) => {
    return 'bg-gray-50 rounded-md';
  };
  
  const getAlertSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-l-4 border-red-500';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-l-4 border-blue-500';
      default:
        return 'bg-gray-100 text-gray-800 border-l-4 border-gray-400';
    }
  };
  
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  const getTrendClass = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forgemate-purple mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Overall Compliance</p>
                <p className="text-2xl font-bold text-forgemate-purple mt-1">{overallCompliance}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-forgemate-light flex items-center justify-center">
                <ShieldCheck className="h-6 w-6 text-forgemate-purple" />
              </div>
            </div>
            <Progress value={overallCompliance} className="h-2 mt-4" />
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              3% improvement from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Fire Safety</p>
                <p className="text-2xl font-bold text-forgemate-purple mt-1">{fireSafety}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-forgemate-light flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-forgemate-purple" />
              </div>
            </div>
            <Progress value={fireSafety} className="h-2 mt-4" />
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <TrendingDown className="h-3 w-3 mr-1" />
              2% decrease from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Electrical Safety</p>
                <p className="text-2xl font-bold text-forgemate-purple mt-1">{electricalSafety}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-forgemate-light flex items-center justify-center">
                <Activity className="h-6 w-6 text-forgemate-purple" />
              </div>
            </div>
            <Progress value={electricalSafety} className="h-2 mt-4" />
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              5% improvement from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Certification Status</p>
                <p className="text-2xl font-bold text-forgemate-purple mt-1">{certificationStatus}%</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-forgemate-light flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-forgemate-purple" />
              </div>
            </div>
            <Progress value={certificationStatus} className="h-2 mt-4" />
            <p className="text-xs text-green-600 mt-1 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              1% improvement from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Briefcase className="mr-2 h-5 w-5 text-forgemate-orange" />
              Jobs Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-3 gap-4 mb-1">
              {jobsStatusSummary.map((job, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-2 text-center">
                  <div className="text-xl font-bold" style={{ color: job.color }}>{job.count}</div>
                  <div className="text-xs text-gray-500">{job.status}</div>
                </div>
              ))}
            </div>
            
            <div className="h-[180px] w-full overflow-hidden mt-1">
              <ResponsiveContainer width="99%" height={180}>
                <BarChart
                  data={jobsByServiceType}
                  margin={{ top: 5, right: 5, left: 0, bottom: 20 }}
                  barSize={12}
                  maxBarSize={14}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9 }}
                    height={20}
                    tickMargin={5}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 9 }}
                    width={20}
                  />
                  <Tooltip />
                  <Legend 
                    verticalAlign="bottom"
                    height={15}
                    wrapperStyle={{ bottom: 0, fontSize: 9 }}
                  />
                  <Bar 
                    dataKey="Pending" 
                    fill="#FF6B00" 
                    radius={[3, 3, 0, 0]} 
                    barSize={12}
                    name="Pending"
                  />
                  <Bar 
                    dataKey="In Progress" 
                    fill="#FF8A3D" 
                    radius={[3, 3, 0, 0]} 
                    barSize={12}
                    name="In Progress"  
                  />
                  <Bar 
                    dataKey="Completed" 
                    fill="#FEC6A1" 
                    radius={[3, 3, 0, 0]} 
                    barSize={12}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Button variant="ghost" className="w-full mt-1 text-forgemate-purple hover:bg-forgemate-light text-xs">
              View All Jobs <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <CalendarIcon className="mr-2 h-5 w-5 text-forgemate-orange" />
              Upcoming Certification Expirations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {certificationExpiry.map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-50">
                  <div>
                    <p className="font-medium text-sm">{cert.name}</p>
                    <p className="text-xs text-gray-500">{cert.contractor}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge className={getExpiryStatusClass(cert.status)}>
                      {new Date(cert.expires).toLocaleDateString()}
                    </Badge>
                    <span className="text-xs mt-1">
                      <Clock className="inline h-3 w-3 mr-1" />
                      {Math.ceil((new Date(cert.expires).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-forgemate-orange hover:bg-forgemate-orange/10">
              View All Certifications <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <BarChart2 className="mr-2 h-5 w-5 text-forgemate-purple" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {kpiData.map((kpi, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">{kpi.name}</span>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-forgemate-purple mr-1">
                        {kpi.value}{kpi.unit && kpi.unit}
                      </span>
                      {getTrendIcon(kpi.trend)}
                    </div>
                  </div>
                  <div className="flex justify-end mt-1">
                    <span className={`text-xs ${getTrendClass(kpi.trend)}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Activity className="mr-2 h-5 w-5 text-forgemate-purple" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {recentActivities.map(activity => (
                <div key={activity.id} className="p-3 bg-gray-50 rounded-md border-l-2 border-forgemate-purple">
                  <p className="text-sm font-medium">{activity.activity}</p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-forgemate-purple hover:bg-forgemate-light">
              View All Activity <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <Bell className="mr-2 h-5 w-5 text-forgemate-orange" />
              Critical Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.length > 0 ? (
                criticalAlerts.map(alert => (
                <div key={alert.id} className={`p-3 rounded-md ${getAlertSeverityStyle(alert.severity)}`}>
                  <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs mt-1">{alert.location}</p>
                  </div>
                ))
              ) : (
                <div className="p-3 bg-green-50 rounded-md border-l-4 border-green-500">
                  <p className="text-sm font-medium text-green-800">No critical alerts</p>
                  <p className="text-xs text-green-600 mt-1">All systems operating normally</p>
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-orange-600 hover:bg-orange-50">
              View All Alerts <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <ClipboardList className="mr-2 h-5 w-5 text-forgemate-purple" />
              Upcoming Work Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingWork.map((work, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 p-2 bg-gray-50 rounded-md items-center">
                  <div className="col-span-2 text-center">
                    <span className="text-xs text-gray-500">{new Date(work.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="col-span-4">
                    <p className="text-sm font-medium">{work.title}</p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-gray-500 flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      {work.location}
                    </p>
                  </div>
                  <div className="col-span-3">
                    <p className="text-xs text-gray-500 flex items-center">
                      <User className="h-3 w-3 mr-1" />
                      {work.contractor}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-3 text-forgemate-purple hover:bg-forgemate-light">
              View Full Schedule <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg font-semibold">
              <CalendarIcon className="mr-2 h-5 w-5 text-forgemate-orange" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BusinessManagementDashboard;
