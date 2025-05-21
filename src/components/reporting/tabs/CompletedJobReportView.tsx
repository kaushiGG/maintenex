import React, { useState, useEffect, useRef } from 'react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Clock, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Image, 
  Clipboard, 
  Printer, 
  Download, 
  Mail,
  Loader2,
  AlertCircle,
  Thermometer
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Observation {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: string;
}

interface ThermalImagingReport {
  id: string;
  job_id: string;
  site_id: string;
  image_type: string;
  uploaded_image: string;
  normal_image?: string;
  analysis_date: string;
  analysis_results: any;
  max_temperature: number;
  min_temperature: number;
  ambient_temperature: number;
  equipment: string;
  location: string;
  status: string;
  hotspots: any[];
  notes: string;
  created_at: string;
}

interface CompletedJob {
  id: string;
  title: string;
  service_type: string;
  site: {
    name: string;
    address: string;
  };
  contractor: {
    name: string;
    contact: string;
  };
  created_at: string;
  started_at: string;
  completed_at: string;
  time_spent: number; // in seconds
  status: string;
  observations: Observation[];
  photos: JobPhoto[];
  equipment_count: number;
  compliance_status: string;
  thermal_imaging_reports?: ThermalImagingReport[];
}

interface CompletedJobReportViewProps {
  jobId: string | null;
}

// Default mock data in case we can't fetch real data
const mockJob: CompletedJob = {
  id: "job-1234",
  title: "Annual Test & Tag Inspection",
  service_type: "Test & Tag",
  site: {
    name: "Brisbane Office",
    address: "123 Adelaide St, Brisbane QLD 4000"
  },
  contractor: {
    name: "SafetyFirst Electrical",
    contact: "john.contractor@example.com"
  },
  created_at: "2023-10-01T09:00:00Z",
  started_at: "2023-10-05T08:30:00Z",
  completed_at: "2023-10-05T16:45:00Z",
  time_spent: 29700, // 8 hours 15 minutes in seconds
  status: "completed",
  observations: [
    {
      id: "obs1",
      category: "Equipment",
      description: "Two power boards in the meeting room have damaged casing",
      severity: "high",
      recommendation: "Replace damaged power boards immediately"
    },
    {
      id: "obs2",
      category: "Compliance",
      description: "All emergency exit signs have been properly tagged",
      severity: "low",
      recommendation: "No action required"
    },
    {
      id: "obs3",
      category: "Safety",
      description: "Extension cords in reception area are creating trip hazards",
      severity: "medium",
      recommendation: "Reroute cables using cable management solutions"
    }
  ],
  photos: [
    {
      id: "photo1",
      url: "/mock-images/damaged-powerboard.jpg",
      caption: "Damaged power board in meeting room",
      timestamp: "2023-10-05T10:30:00Z"
    },
    {
      id: "photo2",
      url: "/mock-images/tagged-equipment.jpg",
      caption: "Properly tagged office equipment",
      timestamp: "2023-10-05T13:45:00Z"
    },
    {
      id: "photo3",
      url: "/mock-images/extension-cords.jpg",
      caption: "Extension cords creating trip hazard",
      timestamp: "2023-10-05T15:20:00Z"
    }
  ],
  equipment_count: 87,
  compliance_status: "Partially Compliant"
};

// Helper function to format time
const formatTimeSpent = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes} minutes`;
  } else if (minutes === 0) {
    return `${hours} hours`;
  } else {
    return `${hours} hours, ${minutes} minutes`;
  }
};

// Helper to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-AU', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Helper for severity badge
const getSeverityBadge = (severity: Observation['severity']) => {
  switch(severity) {
    case 'critical':
      return <Badge className="bg-red-500">Critical</Badge>;
    case 'high':
      return <Badge className="bg-orange-500">High</Badge>;
    case 'medium':
      return <Badge className="bg-yellow-500">Medium</Badge>;
    case 'low':
      return <Badge className="bg-green-500">Low</Badge>;
    default:
      return <Badge>Unknown</Badge>;
  }
};

const CompletedJobReportView: React.FC<CompletedJobReportViewProps> = ({ jobId }) => {
  const [job, setJob] = useState<CompletedJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasThermalReports, setHasThermalReports] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (jobId) {
      fetchJobDetails(jobId);
    } else {
      setLoading(false);
      setJob(null);
    }
  }, [jobId]);

  const fetchJobDetails = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch the job details
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select(`
          *,
          sites:site_id(id, name, address)
        `)
        .eq('id', id)
        .single();
      
      if (jobError) {
        console.error('Error fetching job:', jobError);
        setError('Failed to load job details');
        setLoading(false);
        return;
      }
      
      if (!jobData) {
        setError('Job not found');
        setLoading(false);
        return;
      }

      // Fetch contractor details if available
      let contractorData = {
        name: 'Unknown Contractor',
        contact: 'No contact information'
      };

      if (jobData.contractor_id) {
        const { data: contractor, error: contractorError } = await supabase
          .from('contractors')
          .select('name, contact_email')
          .eq('id', jobData.contractor_id)
          .single();
        
        if (!contractorError && contractor) {
          contractorData = {
            name: contractor.name,
            contact: contractor.contact_email || 'No email provided'
          };
        }
      } else if (jobData.assigned_to) {
        contractorData = {
          name: jobData.assigned_to,
          contact: 'No contact information'
        };
      }

      // Fetch thermal imaging reports for this job
      const { data: thermalReports, error: thermalError } = await supabase
        .from('thermal_reports')
        .select('*')
        .eq('job_id', id);
      
      if (thermalError) {
        console.error('Error fetching thermal reports:', thermalError);
      }
      
      // Convert thermal reports to job photos (until we have a dedicated job_photos table)
      let jobPhotos: JobPhoto[] = [];
      
      if (thermalReports && thermalReports.length > 0) {
        jobPhotos = thermalReports.map(report => ({
          id: report.id,
          url: report.uploaded_image,
          caption: `${report.equipment || 'Equipment'} - ${report.location || 'Location'}`,
          timestamp: report.analysis_date || report.created_at
        }));
        
        // Add normal images as separate photos if available
        thermalReports.forEach(report => {
          if (report.normal_image) {
            jobPhotos.push({
              id: `${report.id}-normal`,
              url: report.normal_image,
              caption: `Standard view: ${report.equipment || 'Equipment'} - ${report.location || 'Location'}`,
              timestamp: report.analysis_date || report.created_at
            });
          } else if (report.analysis_results?.reference_image) {
            jobPhotos.push({
              id: `${report.id}-reference`,
              url: report.analysis_results.reference_image,
              caption: `Standard view: ${report.equipment || 'Equipment'} - ${report.location || 'Location'}`,
              timestamp: report.analysis_date || report.created_at
            });
          }
        });
      }
      
      // Mock observations and photos as they're likely not in the database yet
      const mockObservations: Observation[] = [
        {
          id: "obs1",
          category: "Job Notes",
          description: jobData.description || "No description provided for this job",
          severity: "low",
          recommendation: "See complete report for details"
        }
      ];
      
      // Convert job data to our format
      const formattedJob: CompletedJob = {
        id: jobData.id,
        title: jobData.title || `${jobData.service_type} Job`,
        service_type: jobData.service_type,
        site: {
          name: jobData.sites?.name || 'Unknown Site',
          address: jobData.sites?.address || 'No address provided'
        },
        contractor: contractorData,
        created_at: jobData.created_at,
        started_at: jobData.start_time || jobData.created_at,
        completed_at: jobData.completion_time || jobData.updated_at,
        time_spent: jobData.time_spent || 7200, // Default 2 hours if not provided
        status: jobData.status,
        observations: mockObservations,
        photos: jobPhotos, // Use the photos we extracted from thermal reports
        equipment_count: 0, // No real equipment count in the database yet
        compliance_status: "Completed",
        thermal_imaging_reports: thermalReports || []
      };
      
      setJob(formattedJob);
      setHasThermalReports(thermalReports && thermalReports.length > 0);
    } catch (err) {
      console.error('Exception fetching job details:', err);
      setError('An error occurred while loading job details');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async (e?: React.MouseEvent) => {
    // Prevent default behavior to avoid any navigation
    if (e) e.preventDefault();
    
    if (!job) return;
    
    setIsDownloading(true);
    
    try {
      // Dynamic import of jspdf for client-side only
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont("helvetica");
      
      // Add header
      pdf.setFontSize(16);
      pdf.text(`Job Report: ${job.title}`, 20, 20);
      
      // Add job details
      pdf.setFontSize(12);
      pdf.text('Job Details', 20, 30);
      pdf.setFontSize(10);
      pdf.text(`Service Type: ${job.service_type}`, 25, 38);
      pdf.text(`Site: ${job.site.name}`, 25, 44);
      pdf.text(`Address: ${job.site.address}`, 25, 50);
      pdf.text(`Contractor: ${job.contractor.name}`, 25, 56);
      pdf.text(`Status: ${job.compliance_status}`, 25, 62);
      
      // Add time details
      pdf.setFontSize(12);
      pdf.text('Time Information', 20, 72);
      pdf.setFontSize(10);
      pdf.text(`Created: ${formatDate(job.created_at)}`, 25, 80);
      pdf.text(`Started: ${formatDate(job.started_at)}`, 25, 86);
      pdf.text(`Completed: ${formatDate(job.completed_at)}`, 25, 92);
      pdf.text(`Time Spent: ${formatTimeSpent(job.time_spent)}`, 25, 98);
      
      // Add observations
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Observations & Recommendations', 20, 20);
      
      let yPos = 30;
      job.observations.forEach((observation, index) => {
        pdf.setFontSize(12);
        pdf.text(`Observation ${index + 1}: ${observation.category}`, 20, yPos);
        yPos += 8;
        
        pdf.setFontSize(10);
        pdf.text(`Severity: ${observation.severity.toUpperCase()}`, 25, yPos);
        yPos += 6;
        
        // Split description into multiple lines if needed
        const descLines = pdf.splitTextToSize(observation.description, 160);
        pdf.text(descLines, 25, yPos);
        yPos += descLines.length * 6;
        
        pdf.text(`Recommendation: ${observation.recommendation}`, 25, yPos);
        yPos += 15;
        
        // Add some space between observations
        if (yPos > 250) {
          pdf.addPage();
          yPos = 20;
        }
      });
      
      // Add photos if available
      if (job.photos.length > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Job Photos', 20, 20);
        
        let photoY = 30;
        const promises = job.photos.map(async (photo, index) => {
          if (photo.url && photoY < 250) {
            try {
              // Use fetch to get image data
              const response = await fetch(photo.url);
              const blob = await response.blob();
              
              // Convert blob to base64
              const base64data = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.readAsDataURL(blob);
              });
              
              // Add photo to PDF
              pdf.text(`Photo ${index + 1}: ${photo.caption}`, 20, photoY);
              photoY += 6;
              pdf.text(`Taken: ${formatDate(photo.timestamp)}`, 20, photoY);
              photoY += 6;
              
              // Add the image (with maximum width/height)
              const imgWidth = 160;
              const imgHeight = 100; // Approximate height, will be scaled properly
              
              try {
                pdf.addImage(base64data, 'JPEG', 20, photoY, imgWidth, imgHeight);
              photoY += imgHeight + 15;
              } catch (addImgErr) {
                console.error('Error adding image to PDF:', addImgErr);
                // Add placeholder text instead
                pdf.text('(Image could not be displayed)', 20, photoY);
                photoY += 15;
              }
              
              // Add a new page if needed
              if (photoY > 260 && index < job.photos.length - 1) {
                pdf.addPage();
                photoY = 20;
              }
            } catch (error) {
              console.error('Error processing photo for PDF:', error);
              pdf.text(`Photo ${index + 1}: ${photo.caption} (not displayed)`, 20, photoY);
              photoY += 15;
            }
          }
        });
        
        // Wait for all photos to be processed
        await Promise.all(promises);
      }
      
      // Add thermal imaging data if available
      if (hasThermalReports && job.thermal_imaging_reports && job.thermal_imaging_reports.length > 0) {
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Thermal Imaging Analysis', 20, 20);
        
        let thermalY = 30;
        const thermalPromises = job.thermal_imaging_reports.map(async (report, index) => {
          pdf.setFontSize(12);
          pdf.text(`Report ${index + 1}: ${report.equipment || 'Thermal Analysis'}`, 20, thermalY);
          thermalY += 8;
          
          pdf.setFontSize(10);
          pdf.text(`Location: ${report.location || 'Not specified'}`, 25, thermalY);
          thermalY += 6;
          pdf.text(`Date: ${formatDate(report.analysis_date)}`, 25, thermalY);
          thermalY += 6;
          
          // Add temperature data
          pdf.text(`Temperature Data:`, 25, thermalY);
          thermalY += 6;
          pdf.text(`  • Min: ${report.min_temperature}°C`, 30, thermalY);
          thermalY += 6;
          pdf.text(`  • Max: ${report.max_temperature}°C`, 30, thermalY);
          thermalY += 6;
          pdf.text(`  • Ambient: ${report.ambient_temperature}°C`, 30, thermalY);
          thermalY += 10;
          
          // Add images if available
          try {
            if (report.uploaded_image) {
              // Log image URL for debugging
              console.log('Attempting to load thermal image:', report.uploaded_image);
              
              try {
                // Use fetch to get image data with CORS mode
                const thermalResponse = await fetch(report.uploaded_image, {
                  mode: 'cors',
                  credentials: 'same-origin',
                  headers: {
                    'Cache-Control': 'no-cache',
                  }
                });
                
                if (!thermalResponse.ok) {
                  throw new Error(`Failed to fetch image: ${thermalResponse.status} ${thermalResponse.statusText}`);
                }
                
                const thermalBlob = await thermalResponse.blob();
                
                // Convert blob to base64
                const thermalBase64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    resolve('');
                  };
                  reader.readAsDataURL(thermalBlob);
                });
                
                if (!thermalBase64) {
                  throw new Error('Failed to convert image to base64');
                }
                
                // Calculate dimensions to keep aspect ratio
                const maxWidth = 160;
                const imgWidth = 80; // Fixed width for thermal image
                const imgHeight = 60; // Fixed height for thermal image
                
                // Add thermal image
                pdf.setFontSize(12);
                pdf.text('Thermal Image', 20, thermalY);
                thermalY += 8;
                
                try {
                  pdf.addImage(thermalBase64, 'JPEG', 20, thermalY, imgWidth, imgHeight);
                  console.log('Successfully added thermal image to PDF');
                  thermalY += imgHeight + 15;
                } catch (imgErr) {
                  console.error('Error adding thermal image to PDF:', imgErr);
                  pdf.text('(Could not display thermal image - format error)', 20, thermalY);
                  thermalY += 15;
                }
              } catch (fetchErr) {
                console.error('Error fetching thermal image:', fetchErr);
                pdf.text('(Could not load thermal image)', 20, thermalY);
                thermalY += 15;
              }
            }
            
            // Add normal image if available
            const normalImageUrl = report.normal_image || report.analysis_results?.reference_image;
            if (normalImageUrl) {
              // Log image URL for debugging
              console.log('Attempting to load normal image:', normalImageUrl);
              
              try {
                // Use fetch to get image data with CORS mode
                const normalResponse = await fetch(normalImageUrl, {
                  mode: 'cors',
                  credentials: 'same-origin',
                  headers: {
                    'Cache-Control': 'no-cache',
                  }
                });
                
                if (!normalResponse.ok) {
                  throw new Error(`Failed to fetch image: ${normalResponse.status} ${normalResponse.statusText}`);
                }
                
                const normalBlob = await normalResponse.blob();
                
                // Convert blob to base64
                const normalBase64 = await new Promise<string>((resolve) => {
                  const reader = new FileReader();
                  reader.onloadend = () => resolve(reader.result as string);
                  reader.onerror = (error) => {
                    console.error('Error reading file:', error);
                    resolve('');
                  };
                  reader.readAsDataURL(normalBlob);
                });
                
                if (!normalBase64) {
                  throw new Error('Failed to convert image to base64');
                }
                
                // Calculate dimensions to keep aspect ratio
                const maxWidth = 160;
                const imgWidth = 80; // Fixed width for normal image
                const imgHeight = 60; // Fixed height for normal image
                
                // Add normal image
                pdf.setFontSize(12);
                pdf.text('Standard Image', 20, thermalY);
                thermalY += 8;
                
                try {
                  pdf.addImage(normalBase64, 'JPEG', 20, thermalY, imgWidth, imgHeight);
                  console.log('Successfully added normal image to PDF');
              thermalY += imgHeight + 15;
                } catch (imgErr) {
                  console.error('Error adding normal image to PDF:', imgErr);
                  pdf.text('(Could not display standard image - format error)', 20, thermalY);
                  thermalY += 15;
                }
              } catch (fetchErr) {
                console.error('Error fetching normal image:', fetchErr);
                pdf.text('(Could not load standard image)', 20, thermalY);
                thermalY += 15;
              }
            }
          } catch (error) {
            console.error('Error processing thermal images for PDF:', error);
            pdf.text('Error loading thermal images', 25, thermalY);
            thermalY += 15;
          }
          
          // Add hotspots if available
          if (report.hotspots && report.hotspots.length > 0) {
            pdf.text('Detected Hotspots:', 25, thermalY);
            thermalY += 8;
            
            report.hotspots.forEach((hotspot, spotIndex) => {
              pdf.text(`Hotspot ${spotIndex + 1}:`, 30, thermalY);
              thermalY += 6;
              pdf.text(`Severity: ${hotspot.severity || 'Unknown'}`, 35, thermalY);
              thermalY += 6;
              
              if (hotspot.description) {
                const descLines = pdf.splitTextToSize(hotspot.description, 140);
                pdf.text(descLines, 35, thermalY);
                thermalY += descLines.length * 6;
              }
              
              thermalY += 4;
            });
          }
          
          // Add a new page for the next report
          if (index < job.thermal_imaging_reports.length - 1) {
            pdf.addPage();
            thermalY = 20;
          }
        });
        
        // Wait for all thermal reports to be processed
        await Promise.all(thermalPromises);
      }
      
      // Use saveAs with a more specific context to avoid navigation issues
      pdf.save(`job_report_${job.id}.pdf`);
      
      // Use toast with appropriate formatting
      toast("Report downloaded", {
        description: "Complete job report has been downloaded as a PDF."
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast("Download failed", {
        description: "Failed to generate PDF report. Please try again."
      });
    } finally {
      setIsDownloading(false);
    }
    
    // Return false to prevent any default navigation
    return false;
  };

  const handleDownloadThermalReports = async (e?: React.MouseEvent) => {
    // Prevent default behavior to avoid any navigation
    if (e) e.preventDefault();
    
    if (!job || !job.thermal_imaging_reports || job.thermal_imaging_reports.length === 0) return;
    
    setIsDownloading(true);
    
    try {
      // Dynamic import of jspdf for client-side only
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont("helvetica");
      
      // Add header
      pdf.setFontSize(16);
      pdf.text(`Thermal Imaging Reports: ${job.title}`, 20, 20);
      
      // Add job details
      pdf.setFontSize(12);
      pdf.text('Job Information', 20, 30);
      pdf.setFontSize(10);
      pdf.text(`Service Type: ${job.service_type}`, 25, 38);
      pdf.text(`Site: ${job.site.name}`, 25, 44);
      pdf.text(`Address: ${job.site.address}`, 25, 50);
      pdf.text(`Contractor: ${job.contractor.name}`, 25, 56);
      pdf.text(`Report Generated: ${new Date().toLocaleDateString()}`, 25, 62);
      
      // Process each thermal report
      let currentPage = 1;
      for (let i = 0; i < job.thermal_imaging_reports.length; i++) {
        const report = job.thermal_imaging_reports[i];
        
        // Add a new page for each report (except the first one)
        if (i > 0) {
          pdf.addPage();
          currentPage++;
        }
        
        // Add report header
        pdf.setFontSize(14);
        pdf.text(`Thermal Analysis Report ${i + 1}`, 20, 75);
        
        // Add report details
        pdf.setFontSize(12);
        pdf.text('Equipment Details', 20, 85);
        pdf.setFontSize(10);
        pdf.text(`Equipment: ${report.equipment || 'Not specified'}`, 25, 93);
        pdf.text(`Location: ${report.location || 'Not specified'}`, 25, 99);
        pdf.text(`Analysis Date: ${formatDate(report.analysis_date)}`, 25, 105);
        
        // Add temperature information
        pdf.setFontSize(12);
        pdf.text('Temperature Information', 20, 115);
        pdf.setFontSize(10);
        pdf.text(`Minimum Temperature: ${report.min_temperature}°C`, 25, 123);
        pdf.text(`Maximum Temperature: ${report.max_temperature}°C`, 25, 129);
        pdf.text(`Ambient Temperature: ${report.ambient_temperature}°C`, 25, 135);
        
        // Add thermal image if available
        let yPos = 145;
        try {
          if (report.uploaded_image) {
            // Log image URL for debugging
            console.log('Attempting to load thermal image in report:', report.uploaded_image);
            
            try {
              // Use fetch to get image data with CORS mode
              const thermalResponse = await fetch(report.uploaded_image, {
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                  'Cache-Control': 'no-cache',
                }
              });
              
              if (!thermalResponse.ok) {
                throw new Error(`Failed to fetch image: ${thermalResponse.status} ${thermalResponse.statusText}`);
              }
              
              const thermalBlob = await thermalResponse.blob();
              
              // Convert blob to base64
              const thermalBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (error) => {
                  console.error('Error reading file:', error);
                  resolve('');
                };
                reader.readAsDataURL(thermalBlob);
              });
              
              if (!thermalBase64) {
                throw new Error('Failed to convert image to base64');
              }
            
            // Calculate dimensions to keep aspect ratio
            const maxWidth = 160;
              const imgWidth = 80; // Fixed width for thermal image
              const imgHeight = 60; // Fixed height for thermal image
            
            // Add thermal image
            pdf.setFontSize(12);
            pdf.text('Thermal Image', 20, yPos);
            yPos += 8;
              
              try {
                pdf.addImage(thermalBase64, 'JPEG', 20, yPos, imgWidth, imgHeight);
                console.log('Successfully added thermal image to PDF report');
            yPos += imgHeight + 15;
              } catch (imgErr) {
                console.error('Error adding thermal image to PDF report:', imgErr);
                pdf.text('(Could not display thermal image - format error)', 20, yPos);
                yPos += 15;
              }
            
            // Check if we need a new page for normal image
            if (yPos > 240) {
              pdf.addPage();
              currentPage++;
              yPos = 20;
              }
            } catch (fetchErr) {
              console.error('Error fetching thermal image for report:', fetchErr);
              pdf.text('(Could not load thermal image)', 20, yPos);
              yPos += 15;
            }
          }
          
          // Add normal/reference image if available
          const normalImageUrl = report.normal_image || report.analysis_results?.reference_image;
          if (normalImageUrl) {
            // Log image URL for debugging
            console.log('Attempting to load normal image in report:', normalImageUrl);
            
            try {
              // Use fetch to get image data with CORS mode
              const normalResponse = await fetch(normalImageUrl, {
                mode: 'cors',
                credentials: 'same-origin',
                headers: {
                  'Cache-Control': 'no-cache',
                }
              });
              
              if (!normalResponse.ok) {
                throw new Error(`Failed to fetch image: ${normalResponse.status} ${normalResponse.statusText}`);
              }
              
              const normalBlob = await normalResponse.blob();
              
              // Convert blob to base64
              const normalBase64 = await new Promise<string>((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result as string);
                reader.onerror = (error) => {
                  console.error('Error reading file:', error);
                  resolve('');
                };
                reader.readAsDataURL(normalBlob);
              });
              
              if (!normalBase64) {
                throw new Error('Failed to convert image to base64');
              }
            
            // Calculate dimensions to keep aspect ratio
            const maxWidth = 160;
              const imgWidth = 80; // Fixed width for normal image
              const imgHeight = 60; // Fixed height for normal image
            
            // Add normal image
            pdf.setFontSize(12);
            pdf.text('Standard Image', 20, yPos);
            yPos += 8;
              
              try {
                pdf.addImage(normalBase64, 'JPEG', 20, yPos, imgWidth, imgHeight);
                console.log('Successfully added normal image to PDF report');
            yPos += imgHeight + 15;
              } catch (imgErr) {
                console.error('Error adding normal image to PDF report:', imgErr);
                pdf.text('(Could not display standard image - format error)', 20, yPos);
                yPos += 15;
              }
            
            // Check if we need a new page for hotspots
            if (yPos > 240 && report.hotspots && report.hotspots.length > 0) {
              pdf.addPage();
              currentPage++;
              yPos = 20;
              }
            } catch (fetchErr) {
              console.error('Error fetching normal image for report:', fetchErr);
              pdf.text('(Could not load standard image)', 20, yPos);
              yPos += 15;
            }
          }
        } catch (error) {
          console.error('Error adding images to thermal report PDF:', error);
        }
        
        // Add hotspots if available
        if (report.hotspots && report.hotspots.length > 0) {
          pdf.setFontSize(12);
          pdf.text('Detected Hotspots', 20, yPos);
          yPos += 8;
          
          for (let j = 0; j < report.hotspots.length; j++) {
            const hotspot = report.hotspots[j];
            
            pdf.setFontSize(10);
            pdf.text(`Hotspot ${j + 1}`, 25, yPos);
            yPos += 6;
            
            if (hotspot.severity) {
              pdf.text(`Severity: ${hotspot.severity}`, 30, yPos);
              yPos += 6;
            }
            
            if (hotspot.temperature) {
              pdf.text(`Temperature: ${hotspot.temperature}`, 30, yPos);
              yPos += 6;
            }
            
            if (hotspot.description) {
              const descLines = pdf.splitTextToSize(`Description: ${hotspot.description}`, 150);
              pdf.text(descLines, 30, yPos);
              yPos += descLines.length * 6;
            }
            
            yPos += 4;
            
            // Check if we need a new page for the next hotspot
            if (yPos > 250 && j < report.hotspots.length - 1) {
              pdf.addPage();
              currentPage++;
              yPos = 20;
            }
          }
        }
        
        // Add notes if available
        if (report.notes) {
          // Check if we need a new page for notes
          if (yPos > 230) {
            pdf.addPage();
            currentPage++;
            yPos = 20;
          }
          
          pdf.setFontSize(12);
          pdf.text('Notes', 20, yPos);
          yPos += 8;
          
          pdf.setFontSize(10);
          const noteLines = pdf.splitTextToSize(report.notes, 170);
          pdf.text(noteLines, 25, yPos);
        }
      }
      
      // Use saveAs with a more specific context to avoid navigation issues
      pdf.save(`thermal_reports_${job.id}.pdf`);
      
      // Use toast with appropriate formatting
      toast("Reports downloaded", {
        description: `${job.thermal_imaging_reports.length} thermal imaging reports downloaded as PDF.`
      });
    } catch (error) {
      console.error('Error generating thermal reports PDF:', error);
      toast("Download failed", {
        description: "Failed to generate thermal reports PDF. Please try again."
      });
    } finally {
      setIsDownloading(false);
    }
    
    // Return false to prevent any default navigation
    return false;
  };

  // Show loading state
  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
            <p>Loading job report...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show error state
  if (error || !job) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-10">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-red-500 mb-4" />
            <p className="text-lg font-medium">{error || 'No job selected'}</p>
            <p className="text-gray-500 mt-2">
              {!jobId ? 'Please select a job to view details' : 'Try refreshing the page or selecting a different job'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-2xl font-bold">{job.title}</CardTitle>
            <CardDescription>{job.service_type} at {job.site.name}</CardDescription>
          </div>
          <Badge 
            className="bg-green-100 text-green-800 flex items-center gap-1 px-2 py-1"
          >
            <CheckCircle className="h-4 w-4" />
            Completed
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8" ref={reportContentRef}>
        {/* Job Information Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Job Details</h3>
            
            <div className="space-y-2">
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Site:</span>
                <span className="font-medium">{job.site.name}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Address:</span>
                <span>{job.site.address}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Contractor:</span>
                <span>{job.contractor.name}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Contact:</span>
                <span>{job.contractor.contact}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Service Type:</span>
                <span>{job.service_type}</span>
              </div>
              <div className="flex items-start">
                <span className="w-32 text-gray-500">Status:</span>
                <Badge className="bg-green-100 text-green-800">
                  {job.compliance_status}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Time Tracking</h3>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                <span className="w-32 text-gray-500">Created:</span>
                <span>{formatDate(job.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="w-32 text-gray-500">Started:</span>
                <span>{formatDate(job.started_at)}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-gray-500 mr-2" />
                <span className="w-32 text-gray-500">Completed:</span>
                <span>{formatDate(job.completed_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 text-gray-500 mr-2" />
                <span className="w-32 text-gray-500">Time Spent:</span>
                <span>{formatTimeSpent(job.time_spent)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Tabs for different sections of the report */}
        <Tabs defaultValue="findings" className="w-full">
          <TabsList className={`grid w-full ${hasThermalReports ? 'grid-cols-4' : 'grid-cols-3'}`}>
            <TabsTrigger value="findings" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Findings
            </TabsTrigger>
            <TabsTrigger value="photos" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Photos
            </TabsTrigger>
            {hasThermalReports && (
              <TabsTrigger value="thermal" className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                Thermal Reports
              </TabsTrigger>
            )}
            <TabsTrigger value="report" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Full Report
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="findings" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Observations & Recommendations</h3>
              
              <div className="space-y-4">
                {job.observations.length > 0 ? (
                  job.observations.map(observation => (
                    <Card key={observation.id} className="border p-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{observation.category}</span>
                            {getSeverityBadge(observation.severity)}
                          </div>
                          <p>{observation.description}</p>
                          <div className="pt-2">
                            <span className="text-sm font-medium block">Recommendation:</span>
                            <p className="text-sm">{observation.recommendation}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No observations or findings recorded for this job.
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="photos" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Job Photos</h3>
              
              {job.photos.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {job.photos.map(photo => (
                    <Card key={photo.id} className="overflow-hidden">
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        {photo.url ? (
                          <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="h-12 w-12 text-gray-400" />
                        )}
                      </div>
                      <div className="p-3">
                        <p className="font-medium">{photo.caption}</p>
                        <p className="text-sm text-gray-500">{formatDate(photo.timestamp)}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <Image className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500">No photos available for this job</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          {hasThermalReports && (
            <TabsContent value="thermal" className="pt-4">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold">Thermal Imaging Reports</h3>
                
                {job.thermal_imaging_reports && job.thermal_imaging_reports.length > 0 ? (
                  <div className="space-y-8">
                    {job.thermal_imaging_reports.map(report => (
                      <Card key={report.id} className="overflow-hidden">
                        <CardHeader>
                          <CardTitle className="text-lg">{report.equipment || 'Thermal Analysis'}</CardTitle>
                          <CardDescription>
                            Analyzed on {formatDate(report.analysis_date)} | Location: {report.location || 'Not specified'}
                          </CardDescription>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Thermal Image */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-700">Thermal Image</h4>
                              <div className="h-64 bg-gray-200 rounded-md overflow-hidden">
                                {report.uploaded_image ? (
                                  <img 
                                    src={report.uploaded_image} 
                                    alt="Thermal Image" 
                                    className="w-full h-full object-contain" 
                                  />
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <Thermometer className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Normal Image (if available) */}
                            <div className="space-y-2">
                              <h4 className="font-medium text-gray-700">Standard Image</h4>
                              <div className="h-64 bg-gray-200 rounded-md overflow-hidden">
                                {report.normal_image ? (
                                  <img 
                                    src={report.normal_image} 
                                    alt="Standard Image" 
                                    className="w-full h-full object-contain" 
                                  />
                                ) : report.analysis_results?.reference_image ? (
                                  <img 
                                    src={report.analysis_results.reference_image} 
                                    alt="Standard Image" 
                                    className="w-full h-full object-contain" 
                                  />
                                ) : (
                                  <div className="h-full flex items-center justify-center">
                                    <Image className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Temperature Data */}
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">Temperature Information</h4>
                            <div className="grid grid-cols-3 gap-4">
                              <div className="p-3 bg-blue-50 rounded-md text-center">
                                <p className="text-sm text-gray-500">Min Temperature</p>
                                <p className="text-xl font-bold text-blue-600">{report.min_temperature}°C</p>
                              </div>
                              <div className="p-3 bg-orange-50 rounded-md text-center">
                                <p className="text-sm text-gray-500">Max Temperature</p>
                                <p className="text-xl font-bold text-orange-600">{report.max_temperature}°C</p>
                              </div>
                              <div className="p-3 bg-gray-50 rounded-md text-center">
                                <p className="text-sm text-gray-500">Ambient</p>
                                <p className="text-xl font-bold text-gray-600">{report.ambient_temperature}°C</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Hotspots */}
                          {report.hotspots && report.hotspots.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-700 mb-3">Detected Hotspots</h4>
                              <div className="space-y-2">
                                {report.hotspots.map((hotspot, index) => (
                                  <div key={index} className="p-3 border rounded-md">
                                    <div className="flex justify-between">
                                      <span className="font-medium">Hotspot {index + 1}</span>
                                      <Badge className={
                                        hotspot.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                        hotspot.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                        hotspot.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-blue-100 text-blue-800'
                                      }>
                                        {hotspot.severity || 'Unknown Severity'}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{hotspot.description || 'No description provided'}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Notes */}
                          {report.notes && (
                            <div className="pt-2">
                              <h4 className="font-medium text-gray-700 mb-1">Notes</h4>
                              <p className="text-gray-600 text-sm whitespace-pre-line">{report.notes}</p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    
                    <div className="flex justify-end">
                      <Button 
                        className="gap-2"
                        onClick={(e) => handleDownloadThermalReports(e)}
                        disabled={isDownloading}
                      >
                        {isDownloading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating PDF...
                          </>
                        ) : (
                          <>
                            <Download className="h-4 w-4" />
                            Download Thermal Reports
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Thermometer className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500">No thermal imaging reports found for this job</p>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
          
          <TabsContent value="report" className="pt-4">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Complete Job Report</h3>
              <p className="text-gray-500">
                The complete report includes detailed equipment lists, test results, compliance certificates,
                and all documentation related to this service job.
              </p>
              
              <div className="bg-gray-50 border rounded-lg p-6 flex flex-col items-center justify-center">
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-center mb-4">Full report is available for download or printing</p>
                
                <div className="flex flex-wrap gap-3 justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    Print Report
                  </Button>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={(e) => handleDownloadPdf(e)}
                    disabled={isDownloading}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download PDF
                      </>
                    )}
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Report
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" className="flex items-center gap-2">
            <Clipboard className="h-4 w-4" />
            Add Notes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CompletedJobReportView; 