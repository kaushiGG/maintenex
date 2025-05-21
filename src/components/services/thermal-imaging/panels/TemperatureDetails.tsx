
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TemperatureDetailsProps {
  temperatures: {
    max: number;
    min: number;
    avg: number;
    ambient: number;
  };
}

export const TemperatureDetails: React.FC<TemperatureDetailsProps> = ({ temperatures }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Temperature Readings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Max Temperature</span>
            <div className="flex items-center">
              <span className="font-medium mr-2">{temperatures.max}°C</span>
              {temperatures.max > 80 && (
                <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>
              )}
            </div>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Min Temperature</span>
            <span className="font-medium">{temperatures.min}°C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Average</span>
            <span className="font-medium">{temperatures.avg}°C</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Ambient</span>
            <span className="font-medium">{temperatures.ambient}°C</span>
          </div>
        </div>
        
        <div className="flex items-start mt-4">
          <span className="text-gray-500 mt-2">Scale</span>
          <div className="ml-4 flex">
            <div className="h-44 w-6 rounded bg-gradient-to-b from-red-500 via-yellow-500 to-blue-500"></div>
            <div className="ml-2 flex flex-col justify-between h-44">
              <span className="text-xs text-gray-500">{temperatures.max}°C</span>
              <span className="text-xs text-gray-500">{(temperatures.max + temperatures.min) / 2}°C</span>
              <span className="text-xs text-gray-500">{temperatures.min}°C</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
