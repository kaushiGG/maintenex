import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Briefcase, Clock, Calendar as CalendarIcon, FileCheck, Bell, ChevronRight, AlertTriangle, CheckCircle, FileText, Clipboard, ArrowUpRight, Building, User, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import BusinessManagementDashboard from './BusinessManagementDashboard';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserMode = 'management' | 'provider';

interface JobSummary {
  id: number | string;
  title: string;
  status: string;
  deadline: string;
  location: string;
  assignedTo: string;
  urgent: boolean;
}

interface ActivityItem {
  id: number | string;
  title: string;
  time: string;
  type: string;
  user?: string;
}

interface JobTrend {
  name: string;
  completed: number;
  assigned: number;
}

const OperationsOverview: React.FC<{ userMode: UserMode }> = ({ userMode }) => {
  const [activeJobs, setActiveJobs] = useState<number>(0);
  const [pendingAssignments, setPendingAssignments] = useState<number>(0);
  const [expiringLicenses, setExpiringLicenses] = useState<number>(0);
  const [expiringInsurance, setExpiringInsurance] = useState<number>(0);
  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [jobTrends, setJobTrends] = useState<JobTrend[]>([]);
  const [urgentActions, setUrgentActions] = useState<JobSummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch active jobs
        const { data: jobs, error: jobsError } = await supabase
          .from('jobs')
          .select('*')
          .or('status.eq.pending,status.eq.in_progress,status.eq.assigned');
          
        if (jobsError) throw jobsError;
        const activeJobsCount = jobs?.length || 0;
        setActiveJobs(activeJobsCount);
        
        // Fetch pending assignments
        const { data: pendingJobs, error: pendingJobsError } = await supabase
          .from('jobs')
          .select('*')
          .eq('status', 'pending');
          
        if (pendingJobsError) throw pendingJobsError;
        setPendingAssignments(pendingJobs?.length || 0);
        
        // Fetch expiring licenses within next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        const { data: licenses, error: licensesError } = await supabase
          .from('contractor_licenses')
          .select('*')
          .lt('expiry_date', thirtyDaysFromNow.toISOString())
          .gt('expiry_date', new Date().toISOString());
          
        if (licensesError) throw licensesError;
        setExpiringLicenses(licenses?.length || 0);
        
        // Fetch expiring insurance policies within next 30 days
        const { data: insurance, error: insuranceError } = await supabase
          .from('contractor_insurance')
          .select('*')
          .lt('expiry_date', thirtyDaysFromNow.toISOString())
          .gt('expiry_date', new Date().toISOString());
          
        if (insuranceError) {
          // If table doesn't exist, set to default value
          setExpiringInsurance(0);
        } else {
          setExpiringInsurance(insurance?.length || 0);
        }
        
        // Fetch recent activity feed - using jobs data since activity_feed doesn't exist
        const { data: jobsForActivity, error: jobsForActivityError } = await supabase
          .from('jobs')
          .select('id, status, created_at, building_type, assigned_to, title')
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
              timeString = `${Math.floor(diffMins / 1440)} days ago`;
            }
            
            return {
              id: job.id || index + 1,
              title: `Job "${job.title || 'Untitled'}" was ${job.status || 'updated'}`,
              time: timeString,
              type: 'job',
              user: job.assigned_to || 'System'
            };
          });
          
          setActivityFeed(formattedActivities);
        } else {
          // If no jobs found, provide default activity
          setActivityFeed([{
            id: 1,
            title: 'No recent activity recorded',
            time: 'Just now',
            type: 'system'
          }]);
        }
        
        // Generate job trends data
        // We'll use the last 6 months data
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const { data: historicalJobs, error: historicalJobsError } = await supabase
          .from('jobs')
          .select('created_at, status')
          .gte('created_at', sixMonthsAgo.toISOString());
          
        if (historicalJobsError) throw historicalJobsError;
        
        if (historicalJobs && historicalJobs.length > 0) {
          // Group by month
          const monthlyData: Record<string, {completed: number, assigned: number}> = {};
          
          historicalJobs.forEach(job => {
            const date = new Date(job.created_at);
            const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
            
            if (!monthlyData[monthYear]) {
              monthlyData[monthYear] = { completed: 0, assigned: 0 };
            }
            
            if (job.status === 'completed') {
              monthlyData[monthYear].completed++;
            }
            
            monthlyData[monthYear].assigned++;
          });
          
          // Convert to chart format
          const jobTrendsData = Object.entries(monthlyData).map(([name, data]) => ({
            name,
            completed: data.completed,
            assigned: data.assigned
          }));
          
          // Sort by date
          const sortedTrends = jobTrendsData.sort((a, b) => {
            const aDate = new Date(a.name);
            const bDate = new Date(b.name);
            return aDate.getTime() - bDate.getTime();
          });
          
          setJobTrends(sortedTrends);
        } else {
          // Generate demo data if no historical jobs
          const currentDate = new Date();
          const trendData: JobTrend[] = [];
          
          for (let i = 5; i >= 0; i--) {
            const month = new Date();
            month.setMonth(currentDate.getMonth() - i);
            const monthName = month.toLocaleString('default', { month: 'short' });
            
            trendData.push({
              name: `${monthName} ${month.getFullYear()}`,
              completed: Math.floor(Math.random() * 20) + 5,
              assigned: Math.floor(Math.random() * 30) + 10
            });
          }
          
          setJobTrends(trendData);
        }
        
        // Fetch urgent actions using created_at as a proxy for scheduling
        const { data: urgentJobs, error: urgentJobsError } = await supabase
          .from('jobs')
          .select('id, building_type, status, created_at, assigned_to')
          .or('status.eq.pending,status.eq.overdue')
          .order('created_at', { ascending: true })
          .limit(5);
          
        if (urgentJobsError) throw urgentJobsError;
        
        if (urgentJobs && urgentJobs.length > 0) {
          const formattedUrgentJobs = urgentJobs.map(job => {
            const now = new Date();
            // Calculate virtual deadline based on creation date
            // Assuming jobs are expected to be completed within 7 days
            const createdDate = new Date(job.created_at);
            const deadline = new Date(createdDate);
            deadline.setDate(createdDate.getDate() + 7);
            
            const isUrgent = deadline < now;
            
            return {
              id: job.id,
              title: job.building_type ? `${job.building_type} Service` : 'Untitled Job',
              status: job.status === 'overdue' ? 'Overdue' : 'Pending',
              deadline: deadline.toLocaleDateString(),
              location: 'Main Office', // Default since we don't have site_name
              assignedTo: job.assigned_to || 'Unassigned',
              urgent: isUrgent
            };
          });
          
          setUrgentActions(formattedUrgentJobs);
        } else {
          setUrgentActions([]);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
        
        // Set default fallback data
        setActiveJobs(12);
        setPendingAssignments(5);
        setExpiringLicenses(3);
        setExpiringInsurance(2);
        setActivityFeed([{
          id: 1,
          title: 'Error loading activity feed',
          time: 'Just now',
          type: 'system'
        }]);
        setJobTrends([
          { name: 'Jan', completed: 10, assigned: 15 },
          { name: 'Feb', completed: 12, assigned: 18 },
          { name: 'Mar', completed: 15, assigned: 20 }
        ]);
        setUrgentActions([{
          id: 1,
          title: 'System Error',
          status: 'Error',
          deadline: new Date().toLocaleDateString(),
          location: 'System',
          assignedTo: 'Admin',
          urgent: true
        }]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Set up real-time subscriptions for updates
    const jobsSubscription = supabase
      .channel('dashboard_operations_jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs' }, 
        () => fetchDashboardData())
      .subscribe();
    
    const licensesSubscription = supabase
      .channel('dashboard_licenses')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contractor_licenses' }, 
        () => fetchDashboardData())
      .subscribe();
    
    const insuranceSubscription = supabase
      .channel('dashboard_insurance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contractor_insurance' }, 
        () => fetchDashboardData())
      .subscribe();
    
    // Clean up subscriptions
    return () => {
      jobsSubscription.unsubscribe();
      licensesSubscription.unsubscribe();
      insuranceSubscription.unsubscribe();
    };
  }, []);
  
  if (userMode === 'management') {
    return <BusinessManagementDashboard />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forgemate-purple mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading operations data...</p>
                  </div>
                </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Jobs</p>
                <p className="text-2xl font-bold text-forgemate-purple mt-1">{activeJobs}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-forgemate-light flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-forgemate-purple" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-forgemate-purple hover:bg-forgemate-light">
              View All Jobs <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
          
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Assignments</p>
                <p className="text-2xl font-bold text-forgemate-orange mt-1">{pendingAssignments}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clipboard className="h-6 w-6 text-forgemate-orange" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-forgemate-orange hover:bg-orange-100">
              Assign Jobs <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-gray-500">Expiring Licenses</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{expiringLicenses}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <FileCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-blue-600 hover:bg-blue-100">
              Review Licenses <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
          
        <Card className="shadow hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
                <div>
                <p className="text-sm text-gray-500">Expiring Insurance</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{expiringInsurance}</p>
                </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-3 text-xs text-green-600 hover:bg-green-100">
              Review Insurance <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>Job Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={jobTrends}
                  margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stackId="1"
                    stroke="#FF6B00" 
                    fillOpacity={0.6} 
                    fill="#FFE9D6" 
                    strokeWidth={2}
                    name="Completed Jobs"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="assigned" 
                    stackId="1"
                    stroke="#FF8A3D" 
                    fillOpacity={0.6} 
                    fill="#FEC6A1" 
                    strokeWidth={2}
                    name="Assigned Jobs"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {activityFeed.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-md">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-forgemate-light flex items-center justify-center">
                      {activity.type === 'job' ? (
                        <Briefcase className="h-4 w-4 text-forgemate-purple" />
                      ) : activity.type === 'alert' ? (
                        <AlertTriangle className="h-4 w-4 text-forgemate-orange" />
                      ) : (
                        <Info className="h-4 w-4 text-gray-500" />
                      )}
                </div>
              </div>
                <div>
                    <p className="text-sm">{activity.title}</p>
                    <div className="flex items-center mt-1">
                      {activity.user && (
                        <span className="text-xs text-gray-500 mr-2">{activity.user}</span>
                      )}
                      <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-4 text-forgemate-purple hover:bg-forgemate-light">
              View All Activity <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Urgent Actions</CardTitle>
        </CardHeader>
        <CardContent>
          {urgentActions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urgentActions.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">
                      {job.title}
                      {job.urgent && (
                        <Badge variant="destructive" className="ml-2">Urgent</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={job.status === 'Overdue' ? 'destructive' : 'outline'}>
                        {job.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{job.deadline}</TableCell>
                    <TableCell>{job.location}</TableCell>
                    <TableCell>{job.assignedTo}</TableCell>
                    <TableCell>
                      <Button size="sm" className="bg-forgemate-purple hover:bg-forgemate-purple/90">
                        Take Action
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <p className="mt-2 text-lg font-medium">No urgent actions needed</p>
              <p className="text-sm text-gray-500">All tasks are on track or completed</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationsOverview;