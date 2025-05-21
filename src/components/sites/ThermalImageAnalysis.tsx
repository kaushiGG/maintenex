
import React, { useState } from 'react';
import { Thermometer, Upload, Download, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';

interface ThermalImageAnalysisProps {
  item: any;
}

export const ThermalImageAnalysis = ({ item }: ThermalImageAnalysisProps) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any | null>(null);
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target?.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const analyzeImage = () => {
    if (!uploadedImage) return;
    
    setAnalyzing(true);
    
    setTimeout(() => {
      const results = {
        hotspots: [
          { x: 35, y: 45, severity: 'high', temp: '78.2°C' },
          { x: 65, y: 30, severity: 'medium', temp: '65.7°C' }
        ],
        avgTemp: '42.3°C',
        maxTemp: '78.2°C',
        recommendation: 'Immediate maintenance required. High temperature detected at power connection point.'
      };
      
      setAnalysisResult(results);
      setAnalyzing(false);
    }, 2000);
  };
  
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed rounded-md border-gray-300 p-4">
        {!uploadedImage ? (
          <div className="flex flex-col items-center justify-center p-6">
            <Thermometer className="h-10 w-10 text-[#7851CA] mb-2" />
            <p className="text-sm text-gray-500 mb-3">Upload a thermal image of this equipment</p>
            <label className="cursor-pointer">
              <Input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <img 
                src={uploadedImage} 
                alt="Thermal" 
                className="w-full rounded-md"
              />
              
              {analysisResult && (
                <>
                  {analysisResult.hotspots.map((hotspot: any, index: number) => (
                    <div 
                      key={index}
                      className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white
                        ${hotspot.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'}`}
                      style={{ 
                        left: `${hotspot.x}%`, 
                        top: `${hotspot.y}%`,
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      !
                    </div>
                  ))}
                </>
              )}
            </div>
            
            <div className="flex justify-between">
              <label className="cursor-pointer">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Image
                </Button>
              </label>
              
              {!analysisResult && !analyzing && (
                <Button 
                  onClick={analyzeImage} 
                  className="bg-[#7851CA] hover:bg-[#6a46b5]"
                >
                  <Thermometer className="h-4 w-4 mr-2" />
                  Analyze Image
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
      
      {analyzing && (
        <div className="flex flex-col items-center p-4 bg-gray-50 rounded-md">
          <div className="w-10 h-10 border-4 border-t-[#7851CA] border-gray-200 rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-gray-500">Analyzing thermal image...</p>
        </div>
      )}
      
      {analysisResult && (
        <div className="space-y-4">
          <div className="bg-[#7851CA]/10 p-4 rounded-md">
            <h3 className="font-medium text-[#7851CA] mb-2">Analysis Results</h3>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Measurement</TableHead>
                  <TableHead>Value</TableHead>
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
          
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Full Report
          </Button>
        </div>
      )}
    </div>
  );
};
