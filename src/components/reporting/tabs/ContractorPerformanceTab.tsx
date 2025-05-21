
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Clock, CheckCircle, Star } from 'lucide-react';

const ContractorPerformanceTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contractor Performance Reports</CardTitle>
        <CardDescription>
          Analyze and report on contractor performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="font-medium mb-3">Performance Report Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-medium">Response Time</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Analyze contractor response times to service requests
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-medium">Completion Rate</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Evaluate service completion rates and timeliness
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4 flex flex-col items-center text-center">
                <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center mb-3">
                  <Star className="h-6 w-6 text-yellow-600" />
                </div>
                <h4 className="font-medium">Quality Rating</h4>
                <p className="text-sm text-gray-500 mt-1">
                  Review quality ratings and feedback scores
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Select Contractors for Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch id="contractor-abc" defaultChecked />
              <label htmlFor="contractor-abc">ABC Electric</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="contractor-xyz" defaultChecked />
              <label htmlFor="contractor-xyz">XYZ Plumbing</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="contractor-cool" defaultChecked />
              <label htmlFor="contractor-cool">Cool Air Co</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="contractor-fire" />
              <label htmlFor="contractor-fire">FireGuard Ltd</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="contractor-safety" />
              <label htmlFor="contractor-safety">SafetyFirst</label>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button className="gap-2">
            <Star className="h-4 w-4" />
            Generate Performance Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractorPerformanceTab;
