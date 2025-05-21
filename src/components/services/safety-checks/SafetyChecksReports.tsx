import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, PieChart, BarChart3, Filter, ChevronDown } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface SafetyChecksReportsProps {
  siteId: string;
}

const SafetyChecksReports: React.FC<SafetyChecksReportsProps> = ({ siteId }) => {
  const [reportPeriod, setReportPeriod] = useState('year');
  const [reportType, setReportType] = useState('all');
  
  // Mock reports data
  const availableReports = [
    { id: 1, name: 'Annual Safety Compliance Report', date: '2023-12-31', type: 'Compliance', format: 'PDF' },
    { id: 2, name: 'Q4 2023 Safety Audit Summary', date: '2023-10-15', type: 'Audit', format: 'XLSX' },
    { id: 3, name: 'Fire Safety Assessment Report', date: '2023-09-22', type: 'Assessment', format: 'PDF' },
    { id: 4, name: 'Equipment Safety Inspection Report', date: '2023-08-10', type: 'Inspection', format: 'PDF' },
    { id: 5, name: 'Q3 2023 Safety Audit Summary', date: '2023-07-15', type: 'Audit', format: 'XLSX' },
    { id: 6, name: 'Hazard Identification Report', date: '2023-06-20', type: 'Assessment', format: 'PDF' },
    { id: 7, name: 'Q2 2023 Safety Audit Summary', date: '2023-04-15', type: 'Audit', format: 'XLSX' },
    { id: 8, name: 'Workplace Safety Training Report', date: '2023-03-10', type: 'Training', format: 'PDF' },
  ];

  // Mock metrics for dashboard
  const safetyMetrics = {
    complianceRate: 92,
    safetyIncidents: {
      total: 15,
      byType: { minor: 9, moderate: 5, severe: 1 }
    },
    issuesResolved: 28,
    issuesOpen: 3,
    auditsByMonth: {
      jan: 1, feb: 1, mar: 1, apr: 2, may: 1, jun: 1, 
      jul: 1, aug: 2, sep: 1, oct: 1, nov: 1, dec: 2
    },
    complianceByCategory: {
      fire: 95,
      electrical: 90,
      chemical: 88,
      equipment: 94,
      personal: 91
    }
  };

  // Filter reports based on selected type
  const filteredReports = reportType === 'all' 
    ? availableReports 
    : availableReports.filter(report => report.type.toLowerCase() === reportType.toLowerCase());

  return (
    <div className="space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Reports Dashboard</TabsTrigger>
          <TabsTrigger value="list">Available Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between mb-6">
            <h2 className="text-2xl font-bold">Safety Analytics</h2>
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger className="w-[180px]">
                <span>Time Period: {reportPeriod === 'year' ? 'Last Year' : reportPeriod === 'quarter' ? 'Last Quarter' : 'Last Month'}</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="quarter">Last Quarter</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Overall Compliance</div>
                  <div className="text-3xl font-bold mb-1">{safetyMetrics.complianceRate}%</div>
                  <div className="text-xs text-gray-500">+2% from previous period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Safety Incidents</div>
                  <div className="text-3xl font-bold mb-1">{safetyMetrics.safetyIncidents.total}</div>
                  <div className="text-xs text-gray-500">-3 from previous period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Issues Resolved</div>
                  <div className="text-3xl font-bold mb-1">{safetyMetrics.issuesResolved}</div>
                  <div className="text-xs text-gray-500">+7 from previous period</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-500 mb-1">Open Issues</div>
                  <div className="text-3xl font-bold mb-1">{safetyMetrics.issuesOpen}</div>
                  <div className="text-xs text-gray-500">-2 from previous period</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Audits by Month
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-between px-2">
                  {Object.entries(safetyMetrics.auditsByMonth).map(([month, count]) => (
                    <div key={month} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 w-8 rounded-t-sm" 
                        style={{ height: `${count * 20}%` }}
                      ></div>
                      <div className="text-xs mt-1">{month}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-blue-500" />
                  Compliance by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(safetyMetrics.complianceByCategory).map(([category, rate]) => (
                    <div key={category}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium capitalize">{category}</span>
                        <span className="text-sm font-medium">{rate}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-2 rounded-full ${rate >= 95 ? 'bg-green-500' : rate >= 85 ? 'bg-blue-500' : 'bg-yellow-500'}`} 
                          style={{ width: `${rate}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-500" />
                Safety Incidents by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center h-48">
                <div className="space-y-2 w-1/3">
                  {Object.entries(safetyMetrics.safetyIncidents.byType).map(([type, count]) => (
                    <div key={type} className="flex justify-between">
                      <span className="text-sm capitalize">{type}</span>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
                </div>
                <div className="w-2/3 h-full flex justify-center items-center">
                  <div className="relative h-48 w-48">
                    {/* This would be a pie chart in a real implementation */}
                    <div className="absolute inset-0 rounded-full border-8 border-l-yellow-400 border-r-red-500 border-t-blue-500 border-b-green-400"></div>
                    <div className="absolute inset-8 bg-white rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold">{safetyMetrics.safetyIncidents.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Available Reports</h2>
            <div className="flex gap-2 mt-3 sm:mt-0">
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    <span>Filter Reports</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="compliance">Compliance Reports</SelectItem>
                  <SelectItem value="audit">Audit Reports</SelectItem>
                  <SelectItem value="assessment">Assessment Reports</SelectItem>
                  <SelectItem value="inspection">Inspection Reports</SelectItem>
                  <SelectItem value="training">Training Reports</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="gap-2">
                <ChevronDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map(report => (
              <Card key={report.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-md flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-500" />
                    {report.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{report.type}</Badge>
                        <Badge variant="outline" className="bg-gray-50">{report.format}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">Generated: {report.date}</p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button className="gap-2">
          <FileText className="h-4 w-4" />
          Generate New Report
        </Button>
      </div>
    </div>
  );
};

export default SafetyChecksReports; 