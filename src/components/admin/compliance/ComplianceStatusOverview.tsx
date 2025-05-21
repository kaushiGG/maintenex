
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, AlertTriangle, XCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ComplianceStatusOverviewProps {
  complianceData: Array<{ site: string; status: string; score: number; lastAudit: string }>;
}

const ComplianceStatusOverview: React.FC<ComplianceStatusOverviewProps> = ({ complianceData }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <Check className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-pretance-purple">Compliance Status Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {complianceData.map((site, index) => (
            <div key={index} className="border-b pb-4 last:border-0">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium">{site.site}</div>
                <div className={`px-2 py-1 rounded-full flex items-center space-x-1 text-xs ${getStatusColor(site.status)}`}>
                  {getStatusIcon(site.status)}
                  <span className="capitalize">{site.status}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Progress 
                  value={site.score} 
                  className={`h-2 ${getProgressColor(site.score)}`}
                />
                <span className="text-sm font-medium">{site.score}%</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Last audit: {new Date(site.lastAudit).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceStatusOverview;
