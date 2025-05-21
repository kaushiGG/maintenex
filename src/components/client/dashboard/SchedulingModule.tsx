
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, AlertTriangle, Repeat } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

const SchedulingModule = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="calendar">
        <TabsList className="mb-4">
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="automated" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Automated Scheduling
          </TabsTrigger>
          <TabsTrigger value="conflicts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Conflict Detection
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Repeat className="h-4 w-4" />
            Job Templates
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-shrink-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium mb-4">Upcoming Maintenance</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="font-medium">HVAC Maintenance</div>
                      <div className="text-sm text-gray-500">Brisbane Office - Cool Air Co</div>
                      <div className="text-xs mt-1">9:00 AM - 11:00 AM</div>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="font-medium">Electrical Inspection</div>
                      <div className="text-sm text-gray-500">Sydney HQ - ABC Electric</div>
                      <div className="text-xs mt-1">1:00 PM - 3:00 PM</div>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="font-medium">Plumbing Check</div>
                      <div className="text-sm text-gray-500">Melbourne Branch - XYZ Plumbing</div>
                      <div className="text-xs mt-1">Tomorrow, 10:00 AM</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="automated">
          <Card>
            <CardHeader>
              <CardTitle>Automated Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Automated scheduling based on compliance requirements will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="conflicts">
          <Card>
            <CardHeader>
              <CardTitle>Conflict Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Conflict detection for job assignments will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Job Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Recurring job templates will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulingModule;
