
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Clock, Users, Eye, Mail } from 'lucide-react';
import { scheduledReports } from '../mockData';

const ScheduledReportsTab: React.FC = () => {
  const [scheduledFrequency, setScheduledFrequency] = useState("weekly");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Reports Management</CardTitle>
        <CardDescription>
          Configure and manage automated report generation and distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Active Scheduled Reports</h3>
            <p className="text-sm text-gray-500">Configure automated report generation and delivery</p>
          </div>
          <Button className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedule New Report
          </Button>
        </div>
        
        <div className="rounded-md border overflow-hidden mb-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Name</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Next Run</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scheduledReports.map(report => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{report.frequency}</Badge>
                  </TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    {report.nextRun}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5 text-gray-500" />
                      {report.recipients} recipients
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Schedule a New Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Report Template</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compliance">Monthly Compliance Summary</SelectItem>
                    <SelectItem value="contractor">Contractor Performance Analysis</SelectItem>
                    <SelectItem value="service">Service Completion Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Frequency</label>
                <Select value={scheduledFrequency} onValueChange={setScheduledFrequency}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {scheduledFrequency === "weekly" && (
              <div className="mb-4">
                <label className="text-sm text-gray-500 mb-1 block">Day of Week</label>
                <Select defaultValue="monday">
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="mb-4">
              <label className="text-sm text-gray-500 mb-1 block">Recipients</label>
              <Input placeholder="Enter email addresses separated by commas" />
            </div>
            
            <div className="flex justify-end">
              <Button className="gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default ScheduledReportsTab;
