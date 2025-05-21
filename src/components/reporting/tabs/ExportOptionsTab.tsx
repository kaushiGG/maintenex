
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileDown, Printer, Mail } from 'lucide-react';
import { recentExports } from '../mockData';

const ExportOptionsTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Options</CardTitle>
        <CardDescription>
          Export, share, and distribute reports in various formats
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <FileDown className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium">Export Format</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Export Report</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Printer className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-medium">Print Options</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Select defaultValue="full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select print option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Report</SelectItem>
                      <SelectItem value="summary">Summary Only</SelectItem>
                      <SelectItem value="charts">Charts & Graphs</SelectItem>
                      <SelectItem value="data">Data Tables</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button className="w-full">Print Report</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-medium">Email Report</h3>
              </div>
              <div className="space-y-3">
                <Input placeholder="Enter email address" />
                <Button className="w-full">Send Report</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <h3 className="font-medium mb-3">Recent Exports</h3>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Format</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentExports.map(export_ => (
                  <TableRow key={export_.id}>
                    <TableCell className="font-medium">{export_.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{export_.format}</Badge>
                    </TableCell>
                    <TableCell>{export_.date}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-8 gap-1">
                        <FileDown className="h-4 w-4" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-3">Batch Export Options</h3>
          <p className="text-sm text-gray-500 mb-4">
            Select multiple reports to export at once in your preferred format.
          </p>
          <div className="flex justify-end">
            <Button>Configure Batch Export</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportOptionsTab;
