
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface ContractorPerformanceMetricsProps {
  contractorPerformance: Array<{ 
    name: string; 
    reliability: number; 
    onTimeCompletion: number; 
    qualityScore: number; 
    certStatus: string;
  }>;
}

const ContractorPerformanceMetrics: React.FC<ContractorPerformanceMetricsProps> = ({ 
  contractorPerformance 
}) => {
  const getCertStatusBadge = (status: string) => {
    switch (status) {
      case 'valid':
        return <Badge className="bg-green-100 text-green-800 border-0">Valid</Badge>;
      case 'expiring':
        return <Badge className="bg-yellow-100 text-yellow-800 border-0">Expiring Soon</Badge>;
      case 'expired':
        return <Badge className="bg-red-100 text-red-800 border-0">Expired</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={16} 
            className={i < Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
          />
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-pretance-purple">Contractor Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Contractor</th>
                <th className="text-left py-2 px-2">Reliability</th>
                <th className="text-left py-2 px-2">On-Time</th>
                <th className="text-left py-2 px-2">Quality</th>
                <th className="text-left py-2 px-2">Certification</th>
              </tr>
            </thead>
            <tbody>
              {contractorPerformance.map((contractor, index) => (
                <tr key={index} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium">{contractor.name}</td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      {renderStars(contractor.reliability)}
                      <span className="ml-2 text-sm">{contractor.reliability}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-pretance-purple" />
                      <span>{contractor.onTimeCompletion}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center">
                      <CheckCircle size={16} className="mr-1 text-pretance-purple" />
                      <span>{contractor.qualityScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    {getCertStatusBadge(contractor.certStatus)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractorPerformanceMetrics;
