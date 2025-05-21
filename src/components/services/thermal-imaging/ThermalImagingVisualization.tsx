import React from 'react';
import { 
  Thermometer, 
  AlertTriangle, 
  Calendar, 
  Download, 
  PlusCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface HotspotData {
  id: string;
  circuitId: string;
  temperature: number;
  x: number;
  y: number;
  status: 'critical' | 'warning' | 'normal';
  description: string;
}

interface ThermalImagingVisualizationProps {
  imageUrl: string;
  hotspots?: HotspotData[];
  onScheduleRepair?: () => void;
  onDownloadReport?: () => void;
  onAddToMaintenance?: () => void;
}

const ThermalImagingVisualization: React.FC<ThermalImagingVisualizationProps> = ({
  imageUrl,
  hotspots = [],
  onScheduleRepair,
  onDownloadReport,
  onAddToMaintenance
}) => {
  return (
    <div className="space-y-4">
      <div className="relative border rounded-md overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Thermal imaging scan" 
          className="w-full h-auto object-cover"
        />
        
        {hotspots.map((hotspot) => (
          <div
            key={hotspot.id}
            className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs border-2 border-white
              ${hotspot.status === 'critical' ? 'bg-red-500' : hotspot.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`}
            style={{
              left: `${hotspot.x}%`,
              top: `${hotspot.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            !
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Thermometer className="h-5 w-5 mr-2 text-blue-600" />
                Temperature Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hotspots.map((hotspot) => (
                  <div key={hotspot.id} className="flex items-start gap-3">
                    <div className={`mt-1 w-3 h-3 rounded-full 
                      ${hotspot.status === 'critical' ? 'bg-red-500' : 
                        hotspot.status === 'warning' ? 'bg-amber-500' : 'bg-green-500'}`} 
                    />
                    <div>
                      <p className="font-medium">
                        Circuit #{hotspot.circuitId} - 
                        {hotspot.status === 'critical' ? ' Hot spot' : ' Warning'} 
                        ({hotspot.temperature}°C)
                      </p>
                      <p className="text-sm text-gray-500">{hotspot.description}</p>
                    </div>
                  </div>
                ))}

                {hotspots.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No hotspots detected in this scan.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                Recommended Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={onScheduleRepair}
              >
                Schedule Urgent Repair
                <ArrowRight className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={onDownloadReport}
              >
                Download Full Report
                <Download className="h-4 w-4" />
              </Button>
              
              <Separator className="my-2" />
              
              <Button 
                variant="outline" 
                className="w-full border-dashed border-blue-500 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                onClick={onAddToMaintenance}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Maintenance Schedule
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ThermalImagingVisualization;
