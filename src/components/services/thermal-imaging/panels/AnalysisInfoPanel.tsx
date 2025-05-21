
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface AnalysisInfoPanelProps {
  analysisResults: any;
}

export const AnalysisInfoPanel: React.FC<AnalysisInfoPanelProps> = ({ analysisResults }) => {
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
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Analysis Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Type</span>
            <span className="font-medium">
              {analysisResults.type === 'switchboard' ? 'Switchboard Analysis' : analysisResults.type}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Date</span>
            <span className="font-medium">
              {new Date(analysisResults.date).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Location</span>
            <span className="font-medium">{analysisResults.location}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Equipment</span>
            <span className="font-medium">{analysisResults.equipment}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-gray-500">Overall Status</span>
            <span>
              {getStatusBadge(analysisResults.status)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
