
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Hotspot {
  id: string;
  title: string;
  status: 'critical' | 'warning' | 'normal';
  temperature: number;
  location: string;
  threshold: number;
  deviation: number;
  description: string;
}

interface DetectedIssuesProps {
  hotspots: Hotspot[];
}

export const DetectedIssues: React.FC<DetectedIssuesProps> = ({ hotspots }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'critical':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>;
      case 'normal':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">{status}</Badge>;
    }
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Detected Issues</h3>
      
      {hotspots.map((hotspot) => (
        <Card 
          key={hotspot.id} 
          className={`mb-4 border-l-4 ${
            hotspot.status === 'critical' ? 'border-l-red-500' : 
            hotspot.status === 'warning' ? 'border-l-amber-500' : 'border-l-green-500'
          }`}
        >
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold">{hotspot.title}</h4>
              {getStatusBadge(hotspot.status)}
            </div>
            <p className="text-sm text-gray-600 mb-3">{hotspot.description}</p>
            <div className="flex flex-wrap text-xs text-gray-500 gap-x-4">
              <div>Location: {hotspot.location}</div>
              <div>Threshold: {hotspot.threshold}°C</div>
              <div>Deviation: +{hotspot.deviation}°C</div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Card className="mb-4 border-l-4 border-l-green-500">
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold">Normal Operating Temperatures</h4>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>
          </div>
          <p className="text-sm text-gray-600">All other components are operating within normal temperature ranges.</p>
        </CardContent>
      </Card>
    </div>
  );
};
