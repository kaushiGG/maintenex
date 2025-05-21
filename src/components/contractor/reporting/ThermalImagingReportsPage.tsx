import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Download, Calendar, FileText, Eye } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { ThermalReportData } from '@/types/reports';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';

interface ThermalImagingReportsPageProps {
  switchRole?: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const ThermalImagingReportsPage = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}: ThermalImagingReportsPageProps) => {
  const navigate = useNavigate();
  const portalType = 'contractor';
  
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<(ThermalReportData & { job: any, site: any })[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  
  useEffect(() => {
    const fetchThermalReports = async () => {
      setLoading(true);
      
      try {
        // First get the current user/contractor id
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;
        
        if (!userId) {
          console.error('No user ID found');
          setLoading(false);
          return;
        }
        
        // Get all completed jobs by this contractor with thermal imaging service
        const { data: jobsData, error: jobsError } = await supabase
          .from('jobs')
          .select(`
            id,
            title,
            service_type,
            completion_time,
            status,
            site_id,
            sites:site_id(id, name, address)
          `)
          .eq('contractor_id', userId)
          .eq('status', 'completed')
          .eq('service_type', 'thermal imaging');
        
        if (jobsError) {
          console.error('Error fetching jobs:', jobsError);
          setLoading(false);
          return;
        }
        
        if (!jobsData || jobsData.length === 0) {
          console.log('No thermal imaging jobs found');
          setReports([]);
          setLoading(false);
          return;
        }
        
        // Get thermal reports for these jobs
        const jobIds = jobsData.map(job => job.id);
        
        const { data: reportsData, error: reportsError } = await supabase
          .from('thermal_reports')
          .select('*')
          .in('job_id', jobIds);
        
        if (reportsError) {
          console.error('Error fetching thermal reports:', reportsError);
          setLoading(false);
          return;
        }
        
        // Combine the job data with the report data
        const combinedReports = reportsData.map(report => {
          const relatedJob = jobsData.find(job => job.id === report.job_id);
          return {
            ...report,
            job: relatedJob,
            site: relatedJob?.sites
          };
        });
        
        setReports(combinedReports);
        console.log('Thermal imaging reports:', combinedReports);
      } catch (err) {
        console.error('Exception fetching thermal reports:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchThermalReports();
  }, []);
  
  const filterReports = () => {
    return reports.filter(report => {
      // Search term filter
      const matchesSearch = 
        !searchTerm || 
        report.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.site?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.site?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.findings?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Date filter
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const analysisDate = new Date(report.analysis_date);
        const today = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = analysisDate.toDateString() === today.toDateString();
            break;
          case 'week':
            const weekAgo = new Date();
            weekAgo.setDate(today.getDate() - 7);
            matchesDate = analysisDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date();
            monthAgo.setMonth(today.getMonth() - 1);
            matchesDate = analysisDate >= monthAgo;
            break;
          default:
            matchesDate = true;
        }
      }
      
      return matchesSearch && matchesDate;
    });
  };
  
  const filteredReports = filterReports();
  
  const handleViewReport = (jobId: string) => {
    navigate(`/jobs/report/${jobId}`);
  };
  
  const handleExportReports = () => {
    // TODO: Implement export functionality
    console.log('Export thermal reports functionality to be implemented');
  };
  
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Thermal Imaging Reports"
        portalType={portalType}
        userMode={userMode}
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType={portalType}
          userMode={userMode}
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-pretance-purple sm:text-2xl sm:tracking-tight">
                Thermal Imaging Reports
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View thermal imaging analysis reports from your completed jobs
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Button 
                onClick={handleExportReports}
                className="bg-pretance-purple hover:bg-pretance-purple/90"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Reports
              </Button>
            </div>
          </div>
          
          {/* Search and filter */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by site, job title, or findings..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Past Week</SelectItem>
                  <SelectItem value="month">Past Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Reports grid */}
          {loading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading thermal imaging reports...</p>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow-sm">
              <p className="text-gray-500">No thermal imaging reports found.</p>
              {(searchTerm || dateFilter !== 'all') && (
                <p className="text-gray-400 mt-2">Try adjusting your filters.</p>
              )}
              {reports.length === 0 && (
                <p className="text-gray-400 mt-2">You haven't completed any thermal imaging jobs yet.</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReports.map((report) => (
                <Card key={report.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-pretance-purple">
                        {report.job?.title || 'Thermal Report'}
                      </CardTitle>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        Thermal Imaging
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{report.site?.name}</p>
                  </CardHeader>
                  
                  <div className="p-0 h-40 overflow-hidden">
                    <img 
                      src={report.thermal_image_url} 
                      alt="Thermal Image" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  
                  <CardContent className="p-4 pt-3">
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Analysis Date:</span>
                        <span className="font-medium">
                          {new Date(report.analysis_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Temperature Range:</span>
                        <span className="font-medium">
                          {report.min_temp}°C - {report.max_temp}°C
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <h4 className="font-medium text-sm mb-1">Key Findings:</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{report.findings}</p>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 pt-0 flex justify-end">
                    <Button
                      size="sm"
                      onClick={() => handleViewReport(report.job_id)}
                      className="bg-pretance-purple hover:bg-pretance-purple/90"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Report
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
          
          {filteredReports.length > 0 && (
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm text-sm text-gray-600 mt-6">
              <span>Showing {filteredReports.length} reports</span>
              {filteredReports.length < reports.length && (
                <span>{filteredReports.length} of {reports.length} reports</span>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ThermalImagingReportsPage; 