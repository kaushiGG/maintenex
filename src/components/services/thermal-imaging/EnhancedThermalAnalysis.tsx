import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { UploadStep } from './steps/UploadStep';
import { AnalysisStep } from './steps/AnalysisStep';
import { ReportStep } from './steps/ReportStep';
import AnalysisLoader from './steps/AnalysisLoader';
import { supabase } from '@/integrations/supabase/client';

interface EnhancedThermalAnalysisProps {
  siteId?: string;
  siteName?: string;
  siteAddress?: string;
  jobId?: string;
  onComplete?: () => void;
}

const EnhancedThermalAnalysis: React.FC<EnhancedThermalAnalysisProps> = ({
  siteId,
  siteName,
  siteAddress,
  jobId,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [imagingType, setImagingType] = useState<string>('switchboard');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [normalImage, setNormalImage] = useState<string | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('main');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const normalImageInputRef = useRef<HTMLInputElement>(null);
  const reportContentRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image uploaded successfully",
        description: `Uploaded thermal image: ${file.name}`,
      });
    }
  };
  
  const handleNormalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setNormalImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Reference image uploaded successfully",
        description: `Uploaded normal image: ${file.name}`,
      });
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleNormalImageBrowseClick = () => {
    normalImageInputRef.current?.click();
  };

  const handleAnalyzeImage = () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a thermal image first",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate analysis with a timeout
    setTimeout(() => {
      const mockResults = {
        date: new Date().toISOString(),
        type: imagingType,
        location: siteName || "Main Building",
        equipment: imagingType === 'switchboard' ? "Main Distribution Board" : "HVAC System",
        status: "warning",
        temperatures: {
          max: 82.7,
          min: 24.3,
          avg: 42.1,
          ambient: 23.5
        },
        hotspots: [
          {
            id: '1',
            title: 'Overheating Connection Point',
            status: 'critical' as const,
            temperature: 82.7,
            location: 'Terminal Block C',
            threshold: 50,
            deviation: 32.7,
            description: 'Connection point at lower right shows significant overheating (82.7°C). This temperature exceeds safety thresholds by 32.7°C and requires immediate attention.',
            x: 75,
            y: 60
          },
          {
            id: '2',
            title: 'Circuit Breaker Heating',
            status: 'warning' as const,
            temperature: 68.5,
            location: 'Circuit Breaker 3',
            threshold: 60,
            deviation: 8.5,
            description: 'Circuit breaker 3 shows elevated temperature (68.5°C). While not critical, this indicates potential overloading or deterioration.',
            x: 45,
            y: 35
          }
        ]
      };
      
      setAnalysisResults(mockResults);
      setIsAnalyzing(false);
      setCurrentStep(2);
      
      toast({
        title: "Analysis complete",
        description: "Thermal image has been analyzed successfully",
      });
    }, 2000);
  };

  const saveThermalImagingReport = async () => {
    if (!analysisResults) {
      toast({
        title: "No analysis results",
        description: "Please complete the analysis first",
        variant: "destructive"
      });
      return false;
    }

    setIsSaving(true);
    
    try {
      // Generate unique filenames
      const timestamp = new Date().getTime();
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const thermalImageName = `thermal_${timestamp}.jpg`;
      const normalImageName = normalImage ? `normal_${timestamp}.jpg` : null;
      
      let thermalImageUrl = null;
      let normalImageUrl = null;
      
      // Upload thermal image to storage
      if (uploadedImage) {
        // Convert base64 to file
        const thermalBlob = await fetch(uploadedImage).then(r => r.blob());
        
        // Upload to thermalimages bucket
        const { data: thermalData, error: thermalError } = await supabase
          .storage
          .from('thermalimages')
          .upload(thermalImageName, thermalBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });
          
        if (thermalError) {
          console.error('Error uploading thermal image:', thermalError);
          toast({
            title: "Error uploading thermal image",
            description: thermalError.message,
            variant: "destructive"
          });
          setIsSaving(false);
          return false;
        }
        
        // Get public URL
        const { data: { publicUrl: thermalPublicUrl } } = supabase
          .storage
          .from('thermalimages')
          .getPublicUrl(thermalImageName);
          
        thermalImageUrl = thermalPublicUrl;
      }
      
      // Upload normal image to storage if provided
      if (normalImage) {
        // Convert base64 to file
        const normalBlob = await fetch(normalImage).then(r => r.blob());
        
        // Upload to thermalimages bucket
        const { data: normalData, error: normalError } = await supabase
          .storage
          .from('thermalimages')
          .upload(normalImageName!, normalBlob, {
            contentType: 'image/jpeg',
            cacheControl: '3600'
          });
          
        if (normalError) {
          console.error('Error uploading normal image:', normalError);
          toast({
            title: "Error uploading normal image",
            description: normalError.message,
            variant: "destructive"
          });
          // Continue with saving report even if normal image fails
        } else {
          // Get public URL
          const { data: { publicUrl: normalPublicUrl } } = supabase
            .storage
            .from('thermalimages')
            .getPublicUrl(normalImageName!);
            
          normalImageUrl = normalPublicUrl;
        }
      }

      // Prepare data for saving to thermal_reports table
      const reportData = {
        job_id: jobId,
        site_id: siteId,
        image_type: imagingType,
        uploaded_image: thermalImageUrl, // Store URL instead of base64
        normal_image: normalImageUrl, // Store URL instead of base64
        analysis_date: new Date().toISOString(),
        analysis_results: analysisResults,
        max_temperature: analysisResults.temperatures.max,
        min_temperature: analysisResults.temperatures.min,
        ambient_temperature: analysisResults.temperatures.ambient,
        equipment: analysisResults.equipment,
        location: analysisResults.location,
        status: analysisResults.status,
        hotspots: analysisResults.hotspots,
        notes: activeTab === 'notes' ? activeTab : '',
        created_by: userId
      };

      // Also store the normal image URL in analysis_results for backward compatibility
      if (normalImageUrl) {
        reportData.analysis_results = {
          ...reportData.analysis_results,
          reference_image: normalImageUrl
        };
      }

      // Save to thermal_reports table
      const { data, error } = await supabase
        .from('thermal_reports')
        .insert(reportData)
        .select('id');

      if (error) {
        console.error('Error saving thermal imaging report:', error);
        toast({
          title: "Error saving report",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }
      
      console.log('Thermal imaging report saved:', data);
      
      // If the report was started from a job, update the job status to completed
      if (jobId) {
        const { error: jobError } = await supabase.rpc('update_job_status', { 
          job_id: jobId, 
          new_status: 'completed' 
        });
        
        if (jobError) {
          console.error('Error updating job status:', jobError);
          toast({
            title: "Warning",
            description: "Report saved but failed to update job status",
            variant: "destructive"
          });
        }
      }
      
      toast({
        title: "Report saved",
        description: "Thermal imaging report saved successfully",
      });
      
      return true;
    } catch (err) {
      console.error('Error in saveThermalImagingReport:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred while saving the report",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteAnalysis = async () => {
    const saved = await saveThermalImagingReport();
    
    if (saved) {
      toast({
        title: "Analysis completed",
        description: `Thermal analysis report has been saved and is ready for review.`,
      });
      
      if (onComplete) {
        onComplete();
      }
    }
  };

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    
    try {
      // Dynamic import of html2canvas for client-side only
      const html2canvasModule = await import('html2canvas');
      const html2canvas = html2canvasModule.default;
      
      // Dynamic import of jspdf for client-side only
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      
      if (!reportContentRef.current) {
        throw new Error("Report content reference is not available");
      }
      
      // Create the report title
      const title = `Thermal Imaging Report - ${analysisResults?.equipment || 'Analysis'} - ${new Date().toLocaleDateString()}`;
      
      // Create a new PDF document
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.setFont("helvetica");
      pdf.setFontSize(16);
      pdf.text(title, 20, 20);
      
      // Add site and date information
      pdf.setFontSize(12);
      pdf.text(`Site: ${siteName || 'Unknown'}`, 20, 30);
      pdf.text(`Date: ${new Date().toLocaleDateString()}`, 20, 36);
      
      // Capture the thermal image
      if (uploadedImage) {
        const thermalImg = new Image();
        thermalImg.src = uploadedImage;
        
        // Wait for image to load
        await new Promise((resolve) => {
          thermalImg.onload = resolve;
        });
        
        // Add thermal image to PDF
        pdf.text('Thermal Image:', 20, 45);
        pdf.addImage(thermalImg, 'JPEG', 20, 50, 170, 80);
      }
      
      // Add normal image if available
      if (normalImage) {
        const normalImg = new Image();
        normalImg.src = normalImage;
        
        // Wait for image to load
        await new Promise((resolve) => {
          normalImg.onload = resolve;
        });
        
        // Add normal image to PDF
        pdf.text('Reference Image:', 20, 140);
        pdf.addImage(normalImg, 'JPEG', 20, 145, 170, 80);
      } else if (analysisResults?.reference_image) {
        // Use the reference image from analysis results if the direct normalImage is not available
        const refImg = new Image();
        refImg.src = analysisResults.reference_image;
        
        // Wait for image to load
        await new Promise((resolve) => {
          refImg.onload = resolve;
        });
        
        // Add reference image to PDF
        pdf.text('Reference Image:', 20, 140);
        pdf.addImage(refImg, 'JPEG', 20, 145, 170, 80);
      }
      
      // Add analysis results
      pdf.addPage();
      pdf.setFontSize(14);
      pdf.text('Analysis Results', 20, 20);
      
      if (analysisResults) {
        // Add temperature data
        pdf.setFontSize(12);
        pdf.text('Temperature Readings:', 20, 30);
        pdf.text(`Maximum: ${analysisResults.temperatures.max}°C`, 30, 40);
        pdf.text(`Minimum: ${analysisResults.temperatures.min}°C`, 30, 48);
        pdf.text(`Average: ${analysisResults.temperatures.avg}°C`, 30, 56);
        pdf.text(`Ambient: ${analysisResults.temperatures.ambient}°C`, 30, 64);
        
        // Add hotspot information
        pdf.text('Detected Issues:', 20, 80);
        let yOffset = 90;
        
        analysisResults.hotspots.forEach((hotspot: any, index: number) => {
          pdf.setFontSize(11);
          pdf.text(`${index + 1}. ${hotspot.title} (${hotspot.status.toUpperCase()})`, 30, yOffset);
          yOffset += 8;
          pdf.setFontSize(10);
          pdf.text(`Location: ${hotspot.location} - Temperature: ${hotspot.temperature}°C`, 35, yOffset);
          yOffset += 6;
          
          // Split description into multiple lines if needed
          const descLines = pdf.splitTextToSize(hotspot.description, 150);
          descLines.forEach((line: string) => {
            pdf.text(line, 35, yOffset);
            yOffset += 5;
          });
          
          yOffset += 8;
        });
      }
      
      // Save the PDF file
      pdf.save(`thermal_analysis_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Report downloaded",
        description: "Thermal analysis report has been downloaded to your device.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Download failed",
        description: "Failed to generate PDF report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-6 pb-6" ref={reportContentRef}>
      {/* Breadcrumb */}
      <div className="flex text-sm text-gray-500">
        <Button variant="link" className="p-0 h-auto">Services</Button>
        <span className="mx-2">›</span>
        <Button variant="link" className="p-0 h-auto">Thermal Imaging</Button>
        <span className="mx-2">›</span>
        <Button variant="link" className="p-0 h-auto">Analysis</Button>
      </div>

      {/* Page header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-purple-800">Thermal Imaging Analysis</h1>
      </div>

      {/* Step 1: Upload and Configuration */}
      {currentStep === 1 && (
        <UploadStep
          imagingType={imagingType}
          setImagingType={setImagingType}
          siteName={siteName}
          uploadedImage={uploadedImage}
          setUploadedImage={setUploadedImage}
          normalImage={normalImage}
          setNormalImage={setNormalImage}
          isAnalyzing={isAnalyzing}
          handleAnalyzeImage={handleAnalyzeImage}
          handleBrowseClick={handleBrowseClick}
          handleNormalImageBrowseClick={handleNormalImageBrowseClick}
          fileInputRef={fileInputRef}
          normalImageInputRef={normalImageInputRef}
          handleImageUpload={handleImageUpload}
          handleNormalImageUpload={handleNormalImageUpload}
        />
      )}
      
      {isAnalyzing && <AnalysisLoader />}

      {/* Step 2: Analysis Results */}
      {currentStep === 2 && analysisResults && (
        <AnalysisStep
          uploadedImage={uploadedImage}
          normalImage={normalImage}
          analysisResults={analysisResults}
          handleDownloadReport={handleDownloadReport}
          setCurrentStep={setCurrentStep}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDownloading={isDownloading}
          onSaveResults={() => console.log('Results saved')}
        />
      )}
      
      {/* Step 3: Report & Compliance */}
      {currentStep === 3 && analysisResults && (
        <ReportStep
          analysisResults={analysisResults}
          normalImage={normalImage}
          uploadedImage={uploadedImage}
          setCurrentStep={setCurrentStep}
          handleDownloadReport={handleDownloadReport}
          handleCompleteAnalysis={handleCompleteAnalysis}
          isSaving={isSaving}
          isDownloading={isDownloading}
        />
      )}
    </div>
  );
};

export default EnhancedThermalAnalysis;
