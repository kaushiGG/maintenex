
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ComplianceData } from './mockData';

interface ComplianceRateCardProps {
  complianceData: ComplianceData;
}

const ComplianceRateCard: React.FC<ComplianceRateCardProps> = ({ complianceData }) => {
  const getComplianceColorClass = (rate: number) => {
    if (rate >= 90) return "text-green-600";
    if (rate >= 75) return "text-amber-600";
    return "text-red-600";
  };

  const getProgressColorClass = (rate: number) => {
    if (rate >= 90) return "bg-green-600";
    if (rate >= 75) return "bg-amber-600";
    return "bg-red-600";
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          Compliance Overview
          <Badge variant="outline" className={`font-medium text-sm ${getComplianceColorClass(complianceData.overallRate)}`}>
            {complianceData.overallRate}% Compliant
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Overall Compliance</span>
              <span className={getComplianceColorClass(complianceData.overallRate)}>{complianceData.overallRate}%</span>
            </div>
            <Progress 
              value={complianceData.overallRate} 
              className="h-2" 
              indicatorClassName={getProgressColorClass(complianceData.overallRate)} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Service Schedule</span>
                <span className={getComplianceColorClass(complianceData.serviceComplianceRate)}>{complianceData.serviceComplianceRate}%</span>
              </div>
              <Progress 
                value={complianceData.serviceComplianceRate} 
                className="h-2" 
                indicatorClassName={getProgressColorClass(complianceData.serviceComplianceRate)} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Filter Replacement</span>
                <span className={getComplianceColorClass(complianceData.filterReplacementRate)}>{complianceData.filterReplacementRate}%</span>
              </div>
              <Progress 
                value={complianceData.filterReplacementRate} 
                className="h-2" 
                indicatorClassName={getProgressColorClass(complianceData.filterReplacementRate)} 
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Documentation</span>
                <span className={getComplianceColorClass(complianceData.documentationRate)}>{complianceData.documentationRate}%</span>
              </div>
              <Progress 
                value={complianceData.documentationRate} 
                className="h-2" 
                indicatorClassName={getProgressColorClass(complianceData.documentationRate)} 
              />
            </div>
          </div>
          
          <div className="flex justify-between pt-2 text-sm text-gray-500 border-t">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Last audit: {new Date(complianceData.lastAuditDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Next due: {new Date(complianceData.nextAuditDue).toLocaleDateString()}</span>
            </div>
          </div>
          
          {complianceData.issues.length > 0 && (
            <div className="pt-2 space-y-2">
              <h4 className="text-sm font-medium">Compliance Issues</h4>
              {complianceData.issues.map((issue, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <div className="mt-0.5">
                    {issue.severity === 'high' ? (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    ) : issue.severity === 'medium' ? (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <span className={
                    issue.severity === 'high' ? 'text-red-700' :
                    issue.severity === 'medium' ? 'text-amber-700' :
                    'text-blue-700'
                  }>
                    {issue.description}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceRateCard;
