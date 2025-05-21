import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TemperatureDetails } from './TemperatureDetails';
import { AnalysisInfoPanel } from './AnalysisInfoPanel';
import { DetectedIssues } from './DetectedIssues';

interface AnalysisMainPanelProps {
  uploadedImage: string | null;
  normalImage: string | null;
  analysisResults: any;
}

export const AnalysisMainPanel: React.FC<AnalysisMainPanelProps> = ({
  uploadedImage,
  normalImage,
  analysisResults
}) => {
  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="relative">
          <img 
            src={uploadedImage || ''} 
            alt="Thermal Image" 
            className="w-full rounded-md shadow"
          />
          {analysisResults.hotspots.map((hotspot: any) => (
            <div
              key={hotspot.id}
              className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white
                ${hotspot.status === 'critical' ? 'bg-red-500' : 'bg-amber-500'}`}
              style={{
                left: `${hotspot.x}%`,
                top: `${hotspot.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={`${hotspot.location}: ${hotspot.temperature}°C`}
            >
              !
            </div>
          ))}
        </div>
        
        {normalImage ? (
          <div className="relative">
            <img 
              src={normalImage} 
              alt="Normal Reference Image" 
              className="w-full rounded-md shadow"
            />
            <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
              Reference Image
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnalysisInfoPanel analysisResults={analysisResults} />
            <TemperatureDetails temperatures={analysisResults.temperatures} />
          </div>
        )}
      </div>
      
      {normalImage && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <AnalysisInfoPanel analysisResults={analysisResults} />
          <TemperatureDetails temperatures={analysisResults.temperatures} />
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <Card>
          <CardContent className="p-0">
            <img 
              src={uploadedImage || ''} 
              alt="Thermal View" 
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-center text-sm border-t">Thermal Image</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-0">
            <img 
              src={normalImage || uploadedImage || ''} 
              alt="Normal View" 
              className="w-full h-48 object-cover"
            />
            <div className="p-2 text-center text-sm border-t">
              {normalImage ? 'Normal Reference Image' : 'Thermal Overlay'}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <DetectedIssues hotspots={analysisResults.hotspots} />
      
      {analysisResults.type === 'switchboard' && (
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-800 mb-3">Insurance Compliance Status</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Analysis performed by certified technician</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Thermal imaging equipment calibration up to date</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                <span className="text-gray-700">Documentation requirements fulfilled</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
