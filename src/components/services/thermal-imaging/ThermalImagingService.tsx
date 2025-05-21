import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Thermometer, 
  ArrowLeft, 
  Search, 
  PlusCircle, 
  Building, 
  Camera, 
  FileSpreadsheet, 
  AlertTriangle,
  FileImage
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

import EnhancedThermalAnalysis from './EnhancedThermalAnalysis';

const ThermalImagingService = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const siteId = queryParams.get('siteId') || '';
  const siteName = queryParams.get('siteName') || '';
  const siteAddress = queryParams.get('siteAddress') || '';
  const jobId = queryParams.get('jobId') || '';
  
  const handleAnalysisComplete = () => {
    toast({
      title: "Job Completed",
      description: `Thermal imaging analysis for ${siteName} has been completed successfully.`,
    });
    
    // If this was started from a job, navigate back to jobs list
    if (jobId) {
      navigate('/jobs/assigned?tab=completed');
    }
  };
  
  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate('/jobs/assigned')}
          className="mb-2 -ml-2"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Thermometer className="h-6 w-6 mr-2 text-blue-600" />
              Thermal Imaging
            </h1>
            <div className="flex items-center mt-1">
              <Building className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-gray-500">{siteName} • {siteAddress}</span>
            </div>
          </div>
        </div>
      </div>
      
      <EnhancedThermalAnalysis 
        siteId={siteId}
        siteName={siteName}
        siteAddress={siteAddress}
        jobId={jobId}
        onComplete={handleAnalysisComplete}
      />
    </div>
  );
};

export default ThermalImagingService;
