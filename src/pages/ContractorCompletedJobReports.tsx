import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContractorDashboard from '@/components/ContractorDashboard';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, X, Loader2, FileText } from 'lucide-react';
import CompletedJobReportView from '@/components/reporting/tabs/CompletedJobReportView';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Define interfaces for the job data
interface Site {
  id: string;
  name: string;
  address: string;
}

interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
}

interface Observation {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
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
  photos?: JobPhoto[];
  observations?: Observation[];
  description?: string;
}

const ContractorCompletedJobReports = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [completedJobs, setCompletedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  useEffect(() => {
    fetchCompletedJobs();
  }, []);

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

      // Try with ID directly
      const { data: contractorDataId, error: contractorErrorId } = await supabase
        .from('contractors')
        .select('*')
        .eq('id', user.id);
      
      if (contractorErrorId) {
        console.error('Error fetching contractor by id:', contractorErrorId);
      } else if (contractorDataId && contractorDataId.length > 0) {
        console.log('Found contractor by direct id match:', contractorDataId);
        contractorId = user.id; // The user ID is directly the contractor ID
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

  const handleViewReport = (reportId: string | number) => {
    setSelectedJobId(String(reportId));
    const job = completedJobs.find(job => job.id === reportId);
    setSelectedJob(job || null);
    setIsReportOpen(true);
  };

  // Format date function
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownloadReport = async (job: Job, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Fetch additional job details if needed
    if (!job.photos || !job.observations) {
      setIsDownloading(true);
      try {
        const { data: jobData, error: jobError } = await supabase
          .from('jobs')
          .select(`
            *,
            sites:site_id(id, name, address),
            photos:job_photos(id, url, caption, timestamp)
          `)
          .eq('id', job.id)
          .single();
          
        if (jobError) {
          console.error('Error fetching job details for PDF:', jobError);
          toast.error('Failed to download job report details');
          setIsDownloading(false);
          return;
        }
        
        // Update job with additional data
        job = { ...job, ...jobData };
      } catch (err) {
        console.error('Exception fetching job details for PDF:', err);
        toast.error('An error occurred while preparing the report');
        setIsDownloading(false);
        return;
      }
    }
    
    // Create PDF
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      const title = `${job.title || job.service_type} Job Report`;
      pdf.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Add completion date
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const completionDate = `Completed on: ${formatDate(job.completion_time || job.updated_at)}`;
      pdf.text(completionDate, pageWidth / 2, 27, { align: 'center' });
      
      // Add site information section
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Site Information', 20, 40);
      
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Site Name: ${job.sites?.name || 'Unknown Site'}`, 20, 46);
      pdf.text(`Address: ${job.sites?.address || 'No address provided'}`, 20, 51);
      
      // Add job details section
      pdf.setFontSize(14);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Job Details', 20, 63);
      
      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Service Type: ${job.service_type || 'Not specified'}`, 20, 69);
      pdf.text(`Status: Completed`, 20, 74);
      
      // Initialize position for content
      let yPos = 85;
      
      // Add description if available
      if (job.description) {
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Description', 20, yPos);
        
        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        const wrappedText = pdf.splitTextToSize(job.description, pageWidth - 40);
        pdf.text(wrappedText, 20, yPos + 6);
        
        yPos += 12 + (Math.min(wrappedText.length, 10) * 5);
      }
      
      // Add observations if available
      if (job.observations && job.observations.length > 0) {
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Observations', 20, yPos);
        
        yPos += 6;
        pdf.setFontSize(10);
        
        job.observations.forEach((observation, index) => {
          // Check if we need a new page
          if (yPos > 260) {
            pdf.addPage();
            yPos = 20;
          }
          
          pdf.setTextColor(44, 62, 80);
          pdf.text(`${index + 1}. ${observation.category}`, 20, yPos);
          
          yPos += 5;
          pdf.setTextColor(80, 80, 80);
          const descLines = pdf.splitTextToSize(observation.description, pageWidth - 40);
          pdf.text(descLines, 20, yPos);
          
          yPos += (descLines.length * 5) + 2;
          pdf.text(`Severity: ${observation.severity}`, 25, yPos);
          
          yPos += 5;
          const recLines = pdf.splitTextToSize(`Recommendation: ${observation.recommendation}`, pageWidth - 45);
          pdf.text(recLines, 25, yPos);
          
          yPos += (recLines.length * 5) + 8;
        });
      }
      
      // Add photos if available
      if (job.photos && job.photos.length > 0) {
        // Start photos on a new page
        pdf.addPage();
        yPos = 20;
        
        pdf.setFontSize(14);
        pdf.setTextColor(44, 62, 80);
        pdf.text('Photos', 20, yPos);
        
        yPos += 10;
        
        // Process each photo
        const processPhotos = async () => {
          if (!job.photos) return;
          
          for (let i = 0; i < job.photos.length; i++) {
            const photo = job.photos[i];
            
            // Convert image URL to base64 for PDF
            try {
              // For Supabase storage URLs, get the actual URL
              let imgUrl = photo.url;
              if (imgUrl.startsWith('storage:')) {
                const { data } = supabase.storage.from('job-photos').getPublicUrl(imgUrl.replace('storage:', ''));
                imgUrl = data.publicUrl;
              }
              
              // Download and add image to PDF
              const img = new Image();
              img.crossOrigin = 'Anonymous'; // Handle CORS
              img.src = imgUrl;
              
              await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
              });
              
              // Check if we need a new page
              if (yPos > 230) {
                pdf.addPage();
                yPos = 20;
              }
              
              // Calculate image size to fit page width
              const imgWidth = Math.min(pageWidth - 40, 160);
              const imgHeight = (img.height * imgWidth) / img.width;
              
              // Add image to PDF
              const canvas = document.createElement('canvas');
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(img, 0, 0);
              const imgData = canvas.toDataURL('image/jpeg', 0.75);
              
              pdf.addImage(imgData, 'JPEG', 20, yPos, imgWidth, imgHeight);
              
              // Add caption
              yPos += imgHeight + 5;
              pdf.setFontSize(9);
              pdf.setTextColor(100, 100, 100);
              
              const captionText = photo.caption || `Photo ${i + 1}`;
              const dateText = photo.timestamp ? ` (${formatDate(photo.timestamp)})` : '';
              const photoText = pdf.splitTextToSize(`${captionText}${dateText}`, pageWidth - 40);
              
              pdf.text(photoText, 20, yPos);
              yPos += (photoText.length * 5) + 15;
            } catch (err) {
              console.error(`Error processing photo ${i}:`, err);
              // Continue with next photo
            }
          }
        };
        
        await processPhotos();
      }
      
      // Add footer with page numbers
      const pageCount = pdf.internal.pages.length;
      for (let i = 1; i < pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(150, 150, 150);
        pdf.text(`${job.title || job.service_type} - Page ${i} of ${pageCount - 1}`, pageWidth / 2, pdf.internal.pageSize.getHeight() - 10, { align: 'center' });
      }
      
      // Save PDF
      pdf.save(`${job.title || 'Job'}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Report downloaded successfully');
    } catch (err) {
      console.error('Error generating PDF:', err);
      toast.error('Failed to generate PDF report');
    } finally {
      setIsDownloading(false);
    }
  };

  const content = (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">My Completed Job Reports</CardTitle>
            <CardDescription>
              View and access reports for jobs you have completed
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="mb-4">
            <div className="flex items-center justify-between">
              <DialogTitle>Completed Job Report</DialogTitle>
              <div className="flex items-center">
                <DialogClose asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogClose>
              </div>
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

  return (
    <ContractorDashboard
      userRole="contractor"
      handleLogout={handleLogout}
    >
      {content}
    </ContractorDashboard>
  );
};

export default ContractorCompletedJobReports; 