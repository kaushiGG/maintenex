
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, FileSearch, FileDown, CheckCircle, Clock } from 'lucide-react';

const ComplianceReportsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Documentation Reports</CardTitle>
        <CardDescription>
          Generate regulatory compliance reports and documentation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-green-800">Compliant</h3>
                  <p className="text-2xl font-bold text-green-700">85%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-yellow-800">In Progress</h3>
                  <p className="text-2xl font-bold text-yellow-700">12%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-red-800">Non-Compliant</h3>
                  <p className="text-2xl font-bold text-red-700">3%</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <FileSearch className="h-5 w-5 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Available Compliance Reports</h3>
          <div className="space-y-3">
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-pretance-purple mr-3" />
                  <div>
                    <h4 className="font-medium">AS/NZS 3760 Compliance Report</h4>
                    <p className="text-sm text-gray-500">Electrical equipment testing and tagging</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <FileDown className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-pretance-purple mr-3" />
                  <div>
                    <h4 className="font-medium">RCD Testing Compliance Report</h4>
                    <p className="text-sm text-gray-500">AS/NZS 3760 RCD testing requirements</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <FileDown className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-pretance-purple mr-3" />
                  <div>
                    <h4 className="font-medium">Emergency Lighting Compliance</h4>
                    <p className="text-sm text-gray-500">AS/NZS 2293 emergency lighting standards</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <FileDown className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
            
            <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-pretance-purple mr-3" />
                  <div>
                    <h4 className="font-medium">Fire Safety Annual Report</h4>
                    <p className="text-sm text-gray-500">Fire safety equipment and inspection compliance</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="gap-1">
                  <FileDown className="h-4 w-4" />
                  Generate
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button className="gap-1">
            <FileSearch className="h-4 w-4" />
            Generate Comprehensive Compliance Report
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComplianceReportsTab;
