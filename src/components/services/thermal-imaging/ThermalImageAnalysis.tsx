import React, { useState, useRef } from 'react';
import { Thermometer, Upload, Download, AlertTriangle, Calendar, FolderInput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import ThermalImagingVisualization from './ThermalImagingVisualization';

interface ThermalImageAnalysisProps {
  existingImage?: string;
  onSaveAnalysis?: (analysisData: any) => void;
}

export const ThermalImageAnalysis = ({ 
  existingImage,
  onSaveAnalysis 
}: ThermalImageAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(existingImage || null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Image uploaded",
        description: `Successfully uploaded ${file.name}`,
      });
    }
  };
  
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };
  
  const analyzeImage = () => {
    if (!uploadedImage) {
      toast({
        title: "No image selected",
        description: "Please upload a thermal image first",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    // Simulate analysis with a timeout
    setTimeout(() => {
      const results = {
        hotspots: [
          { 
            id: '1', 
            circuitId: '12', 
            temperature: 76, 
            x: 35, 
            y: 45, 
            status: 'critical' as const, 
            description: 'Load imbalance detected',
            severity: 'high', 
            temp: '76°C' 
          },
          { 
            id: '2', 
            circuitId: '21', 
            temperature: 65, 
            x: 65, 
            y: 30, 
            status: 'warning' as const, 
            description: 'Monitor for further increase',
            severity: 'medium', 
            temp: '65°C' 
          }
        ],
        avgTemp: '42.3°C',
        maxTemp: '78.2°C',
        recommendation: 'Immediate maintenance required. High temperature detected at power connection point.',
        date: new Date().toISOString()
      };
      
      setAnalysisResult(results);
      setAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: "Thermal image analyzed successfully",
      });
      
      if (onSaveAnalysis) {
        onSaveAnalysis({
          ...results,
          image: uploadedImage
        });
      }
    }, 2000);
  };

  const handleScheduleRepair = () => {
    toast({
      title: "Repair Scheduled",
      description: "Urgent repair has been scheduled for Circuit #12",
    });
  };

  const handleDownloadReport = () => {
    toast({
      title: "Report Downloaded",
      description: "Thermal analysis report has been downloaded",
    });
  };

  const handleAddToMaintenance = () => {
    toast({
      title: "Added to Maintenance",
      description: "This item has been added to the maintenance schedule",
    });
  };
  
  return (
    <div className="space-y-4">
      {!uploadedImage ? (
        <div className="border-2 border-dashed rounded-md border-gray-300 p-4">
          <div className="flex flex-col items-center justify-center p-6">
            <Thermometer className="h-10 w-10 text-blue-600 mb-2" />
            <p className="text-sm text-gray-500 mb-3">Upload a thermal image of equipment</p>
            <Input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              ref={fileInputRef}
            />
            <Button variant="outline" size="sm" onClick={handleBrowseClick}>
              <FolderInput className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {analysisResult ? (
            <ThermalImagingVisualization
              imageUrl={uploadedImage}
              hotspots={analysisResult.hotspots}
              onScheduleRepair={handleScheduleRepair}
              onDownloadReport={handleDownloadReport}
              onAddToMaintenance={handleAddToMaintenance}
            />
          ) : (
            <div className="border-2 border-dashed rounded-md border-gray-300 p-4">
              <div className="relative">
                <img 
                  src={uploadedImage} 
                  alt="Thermal" 
                  className="w-full rounded-md"
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                />
                <Button variant="outline" size="sm" onClick={handleBrowseClick}>
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
                
                {!analyzing && (
                  <Button 
                    onClick={analyzeImage} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Thermometer className="h-4 w-4 mr-2" />
                    Analyze Image
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
      
      {analyzing && (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-500">Analyzing thermal image...</p>
        </div>
      )}
      
      {analysisResult && (
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="font-medium text-blue-700 mb-2">Analysis Results</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell className="font-medium">Measurement</TableCell>
                  <TableCell className="font-medium">Value</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Average Temperature</TableCell>
                  <TableCell>{analysisResult.avgTemp}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Maximum Temperature</TableCell>
                  <TableCell className="text-red-500 font-medium">{analysisResult.maxTemp}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Hotspots Detected</TableCell>
                  <TableCell>{analysisResult.hotspots.length}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <h4 className="font-medium flex items-center text-yellow-800">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-600" />
                Recommendation
              </h4>
              <p className="text-sm text-yellow-800 mt-1">{analysisResult.recommendation}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
