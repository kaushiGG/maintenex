
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ComplianceReportProps {
  compliance: number;
}

const ComplianceReport: React.FC<ComplianceReportProps> = ({ compliance }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Compliance Overview</h3>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Download className="mr-2 h-4 w-4" />
          Download Full Report
        </Button>
      </div>

      {/* Compliance Score Card */}
      <Card className="overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="bg-purple-50 p-6 flex flex-col items-center justify-center md:w-1/3">
            <div className="relative w-36 h-36">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl font-bold text-purple-700">{compliance}%</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle 
                  className="text-gray-200" 
                  strokeWidth="10" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
                <circle 
                  className="text-purple-600" 
                  strokeWidth="10" 
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 * (1 - compliance/100)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="transparent" 
                  r="40" 
                  cx="50" 
                  cy="50" 
                />
              </svg>
            </div>
            <p className="mt-4 text-purple-700 font-medium">Overall Compliance</p>
          </div>
          <div className="p-6 md:w-2/3">
            <h4 className="font-medium mb-4">Compliance Breakdown</h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Fully Compliant RCDs</span>
                  <span className="font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Partially Compliant RCDs</span>
                  <span className="font-medium">30%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span>Non-Compliant RCDs</span>
                  <span className="font-medium">10%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-green-600">3</p>
                <p className="text-xs text-green-800">Passed</p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">1</p>
                <p className="text-xs text-yellow-800">Warning</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <p className="text-2xl font-bold text-red-600">1</p>
                <p className="text-xs text-red-800">Failed</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Requirements Table */}
      <Card>
        <CardContent className="p-6">
          <h4 className="font-medium mb-4">Compliance Requirements</h4>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requirement</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>AS/NZS 3760:2010 Safety Testing</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Compliant</Badge></TableCell>
                <TableCell>12/03/2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>AS/NZS 3000:2018 Wiring Rules</TableCell>
                <TableCell><Badge className="bg-green-100 text-green-800">Compliant</Badge></TableCell>
                <TableCell>23/05/2024</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>AS/NZS 3012:2019 Construction & Demolition Sites</TableCell>
                <TableCell><Badge className="bg-yellow-100 text-yellow-800">Partial</Badge></TableCell>
                <TableCell>15/04/2023</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Safe Work Australia Code of Practice</TableCell>
                <TableCell><Badge className="bg-red-100 text-red-800">Non-Compliant</Badge></TableCell>
                <TableCell>Immediate</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Recommendations */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h4 className="font-medium flex items-center text-amber-800 mb-2">
            <AlertTriangle className="h-4 w-4 mr-2 text-amber-600" />
            Recommendations
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
              <p className="text-sm">Replace Kitchen Circuit RCD immediately - failed trip testing.</p>
            </li>
            <li className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
              <p className="text-sm">External Power RCD showing trip delay outside recommended range - schedule maintenance within 30 days.</p>
            </li>
            <li className="flex items-start gap-2 text-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-1 flex-shrink-0" />
              <p className="text-sm">Update AS/NZS 3012:2019 compliance documentation for construction area power supply.</p>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComplianceReport;
