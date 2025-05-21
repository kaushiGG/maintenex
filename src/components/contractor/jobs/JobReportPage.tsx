import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, FileText, Clipboard, Tag, Zap, Gauge, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import TestTagReport from './reports/TestTagReport';
import { TestTagReportDataType } from './reports/TestTagReportTypes';
import RCDTestingReport from './reports/RCDTestingReport';
import EmergencyLightingReport from './reports/EmergencyLightingReport';
import ThermalImagingReport from './reports/ThermalImagingReport';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface JobReportPageProps {
  switchRole: () => void;
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  userMode?: UserMode;
}

const JobReportPage: React.FC<JobReportPageProps> = ({ 
  switchRole, 
  userRole, 
  handleLogout,
  userMode = 'provider'
}) => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reportType = searchParams.get('type') || 'test-and-tag';
  const reportId = searchParams.get('reportId');
  const [activeTab, setActiveTab] = useState('test-tag');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Initialize the correct tab based on report type
  useEffect(() => {
    if (reportType) {
      if (reportType === 'test-and-tag') {
        setActiveTab('test-tag');
      } else if (reportType === 'rcd-testing') {
        setActiveTab('rcd-testing');
      } else if (reportType === 'emergency-lighting') {
        setActiveTab('emergency-lighting');
      } else if (reportType === 'thermal-imaging') {
        setActiveTab('thermal-imaging');
      }
    }
  }, [reportType]);

  // Fetch report data when report type and ID are available
  useEffect(() => {
    if (jobId && reportType && reportId) {
      fetchReportData(reportType, reportId);
    }
  }, [jobId, reportType, reportId]);

  const fetchReportData = async (type: string, id: string) => {
    setLoading(true);
    try {
      let tableName = '';
      
      // Map report type to table name
      if (type === 'test-and-tag') {
        tableName = 'test_and_tag_reports';
      } else if (type === 'rcd-testing') {
        tableName = 'rcd_testing_reports';
      } else if (type === 'emergency-lighting') {
        tableName = 'emergency_lighting_reports';
      } else if (type === 'thermal-imaging') {
        tableName = 'thermal_reports';
      } else {
        console.error('Unknown report type:', type);
        toast.error('Unknown report type');
        setLoading(false);
        return;
      }
      
      console.log(`Fetching report data from ${tableName} table, report ID: ${id}`);
      
      // Use the strongly typed table name instead of a string
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        console.error(`Error fetching ${type} report:`, error);
        toast.error(`Failed to load report: ${error.message}`);
      } else if (data) {
        console.log('Report data loaded:', data);
        setReportData(data);
      } else {
        toast.error('No report data found');
      }
    } catch (err) {
      console.error('Error in fetchReportData:', err);
      toast.error('An error occurred while loading the report');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleDownloadReport = async () => {
    if (!jobId || !reportType) {
      toast.error('Missing job ID or report type');
      return;
    }
    
    try {
      setLoading(true);
      toast.info('Preparing report for download...');
      
      // Get the report element to capture
      const reportElement = document.getElementById('report-content');
      if (!reportElement) {
        toast.error('Report content not found');
        setLoading(false);
        return;
      }
      
      // Use html2canvas to capture the report as an image
      const canvas = await html2canvas(reportElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable cross-origin images
        logging: false, // Disable logs
      });
      
      // Create PDF with appropriate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add the captured image to the PDF
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate a meaningful filename based on report type and job ID
      const reportTypeFormatted = reportType.replace(/-/g, '_').replace('and', '&');
      const filename = `${reportTypeFormatted}_report_job_${jobId}.pdf`;
      
      // Save the PDF
      pdf.save(filename);
      
      toast.success('Report downloaded successfully');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  const handleShareReport = () => {
    console.log(`Sharing report for job ID: ${jobId}`);
    toast.info('Sharing functionality is not yet implemented');
    // This would be implemented with email or link sharing functionality
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader
        switchRole={switchRole}
        userRole={userRole}
        handleLogout={handleLogout}
        title="Job Report"
        showBackButton={true}
        backTo="/jobs"
        backText="Back to Jobs"
        portalType={userRole === 'business' ? 'business' : 'contractor'}
        userMode={userMode}
      />

      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType={userRole === 'business' ? 'business' : 'contractor'}
          userMode={userMode}
        />

        <main className="flex-1 p-4 sm:p-6 bg-gray-50 overflow-x-hidden">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate sm:tracking-tight">
                Job Report: {jobId}
              </h2>
              <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <FileText className="mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Full Job Details
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clipboard className="mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                  Compliance Status: Compliant
                </div>
              </div>
            </div>
            <div className="mt-5 flex md:mt-0 md:ml-4">
              <Button onClick={() => navigate(-1)}>
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back
              </Button>
              <Button 
                className="ml-3" 
                onClick={handleDownloadReport}
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
                {loading ? 'Preparing...' : 'Download Report'}
              </Button>
              <Button className="ml-3" onClick={handleShareReport}>
                <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
                Share
              </Button>
            </div>
          </div>

          <div id="report-content">
            <Tabs defaultValue="test-tag" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="test-tag">Test & Tag</TabsTrigger>
                <TabsTrigger value="rcd-testing">RCD Testing</TabsTrigger>
                <TabsTrigger value="emergency-lighting">Emergency Lighting</TabsTrigger>
                <TabsTrigger value="thermal-imaging">Thermal Imaging</TabsTrigger>
              </TabsList>
              <TabsContent value="test-tag">
                <TestTagReport reportData={reportData} isLoading={loading} />
              </TabsContent>
              <TabsContent value="rcd-testing">
                <RCDTestingReport reportData={reportData} isLoading={loading} />
              </TabsContent>
              <TabsContent value="emergency-lighting">
                <EmergencyLightingReport reportData={reportData} isLoading={loading} />
              </TabsContent>
              <TabsContent value="thermal-imaging">
                <ThermalImagingReport reportData={reportData} isLoading={loading} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
};

export default JobReportPage;
