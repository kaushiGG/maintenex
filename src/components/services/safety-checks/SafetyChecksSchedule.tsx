import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, UserCheck, Building, ClipboardCheck, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SafetyChecksScheduleProps {
  siteId: string;
}

// Mock months for the calendar view
const months = [
  'January', 'February', 'March', 'April',
  'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
];

const SafetyChecksSchedule: React.FC<SafetyChecksScheduleProps> = ({ siteId }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [view, setView] = useState<'calendar' | 'list'>('list');
  
  // Mock scheduled audits data
  const scheduledAudits = [
    {
      id: 1,
      date: '2024-05-15',
      type: 'Comprehensive Safety Audit',
      auditor: 'Sarah Johnson',
      location: 'Main Building',
      status: 'Scheduled',
      duration: '3 hours'
    },
    {
      id: 2,
      date: '2024-06-10',
      type: 'Fire Safety Inspection',
      auditor: 'John Smith',
      location: 'All Buildings',
      status: 'Scheduled',
      duration: '2 hours'
    },
    {
      id: 3,
      date: '2024-07-22',
      type: 'Equipment Safety Check',
      auditor: 'Mike Williams',
      location: 'Workshop Area',
      status: 'Scheduled',
      duration: '4 hours'
    },
    {
      id: 4,
      date: '2024-08-05',
      type: 'Workplace Hazard Assessment',
      auditor: 'Sarah Johnson',
      location: 'Main Building',
      status: 'Scheduled',
      duration: '2 hours'
    },
    {
      id: 5,
      date: '2024-11-15',
      type: 'Comprehensive Safety Audit',
      auditor: 'John Smith',
      location: 'All Buildings',
      status: 'Pending Assignment',
      duration: '3 hours'
    }
  ];

  // Next and previous month handlers
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Scheduled Safety Checks</h2>
        <div className="flex gap-2 mt-3 sm:mt-0">
          <Select value={view} onValueChange={(value: 'calendar' | 'list') => setView(value)}>
            <SelectTrigger className="w-[140px]">
              <span>View: {view === 'calendar' ? 'Calendar' : 'List'}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="calendar">Calendar</SelectItem>
              <SelectItem value="list">List</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Schedule Audit
          </Button>
        </div>
      </div>

      {view === 'list' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Upcoming Scheduled Audits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Auditor</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {scheduledAudits.map(audit => (
                  <TableRow key={audit.id}>
                    <TableCell className="font-medium">{audit.date}</TableCell>
                    <TableCell>{audit.type}</TableCell>
                    <TableCell>{audit.auditor}</TableCell>
                    <TableCell>{audit.location}</TableCell>
                    <TableCell>{audit.duration}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        audit.status === 'Scheduled' 
                          ? 'bg-green-50 text-green-800' 
                          : 'bg-yellow-50 text-yellow-800'
                      }>
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Safety Checks Calendar</CardTitle>
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium">
                {months[currentMonth]} {currentYear}
              </span>
              <Button variant="outline" size="icon" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2 text-sm font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {/* Calendar grid would be dynamically generated here based on current month/year */}
              {/* This is a simplified placeholder for the calendar UI */}
              {Array.from({ length: 35 }, (_, i) => (
                <div 
                  key={i} 
                  className={`
                    aspect-square border rounded-md p-1 
                    ${i % 7 === 0 || i % 7 === 6 ? 'bg-gray-50' : ''}
                    ${i === 14 || i === 24 ? 'bg-blue-50 border-blue-200' : ''}
                  `}
                >
                  <div className="text-sm">{(i % 30) + 1}</div>
                  {i === 14 && (
                    <div className="mt-1">
                      <Badge className="text-[10px] bg-blue-100 text-blue-800 hover:bg-blue-100">
                        Audit
                      </Badge>
                    </div>
                  )}
                  {i === 24 && (
                    <div className="mt-1">
                      <Badge className="text-[10px] bg-green-100 text-green-800 hover:bg-green-100">
                        Check
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              Assigned Auditors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 h-10 w-10 rounded-full flex items-center justify-center">
                    JS
                  </div>
                  <div>
                    <p className="font-medium">John Smith</p>
                    <p className="text-sm text-gray-500">Safety Officer</p>
                  </div>
                </div>
                <Badge variant="outline">2 Audits</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 h-10 w-10 rounded-full flex items-center justify-center">
                    SJ
                  </div>
                  <div>
                    <p className="font-medium">Sarah Johnson</p>
                    <p className="text-sm text-gray-500">Lead Auditor</p>
                  </div>
                </div>
                <Badge variant="outline">2 Audits</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 h-10 w-10 rounded-full flex items-center justify-center">
                    MW
                  </div>
                  <div>
                    <p className="font-medium">Mike Williams</p>
                    <p className="text-sm text-gray-500">Equipment Specialist</p>
                  </div>
                </div>
                <Badge variant="outline">1 Audit</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-blue-500" />
              Locations to Check
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="font-medium">Main Building</p>
                </div>
                <Badge variant="outline">2 Audits</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="font-medium">Workshop Area</p>
                </div>
                <Badge variant="outline">1 Audit</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Building className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="font-medium">All Buildings</p>
                </div>
                <Badge variant="outline">2 Audits</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Plan Safety Check Schedule
        </Button>
      </div>
    </div>
  );
};

export default SafetyChecksSchedule; 