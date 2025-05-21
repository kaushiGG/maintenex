
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

// Mock data for schedule conflicts
const mockConflicts = [
  {
    id: 1,
    type: 'overlap',
    date: new Date(2023, 9, 15),
    conflictingJobs: [
      {
        id: 101,
        title: 'Thermal Imaging - Factory',
        time: '10:00 AM - 1:00 PM',
        location: '123 Industry Way, North Side',
        client: 'Manufacturing Inc.',
        type: 'thermal'
      },
      {
        id: 102,
        title: 'RCD Testing - Office Building',
        time: '12:00 PM - 3:00 PM',
        location: '456 Business Ave, Downtown',
        client: 'Corporate Services LLC',
        type: 'rcd'
      }
    ]
  },
  {
    id: 2,
    type: 'distance',
    date: new Date(2023, 9, 18),
    conflictingJobs: [
      {
        id: 103,
        title: 'Plumbing Inspection - Restaurant',
        time: '9:00 AM - 11:00 AM',
        location: '789 Dining St, East District',
        client: 'Fine Dining Ltd',
        type: 'plumbing'
      },
      {
        id: 104,
        title: 'Test & Tag - Retail Store',
        time: '12:00 PM - 2:00 PM',
        location: '321 Shopping Blvd, West End (35 km away)',
        client: 'Retail Chain Inc.',
        type: 'test-tag'
      }
    ]
  },
];

const ScheduleConflicts = () => {
  // Get badge color based on job type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'test-tag': return 'bg-blue-500';
      case 'rcd': return 'bg-purple-500';
      case 'emergency': return 'bg-red-500';
      case 'thermal': return 'bg-orange-500';
      case 'plumbing': return 'bg-cyan-500';
      case 'ac': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get conflict type message
  const getConflictMessage = (type: string) => {
    switch (type) {
      case 'overlap': return 'Time Overlap';
      case 'distance': return 'Distance Issue';
      default: return 'Scheduling Conflict';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-medium">Schedule Conflicts</h2>
          <Badge className="bg-red-100 text-red-800">
            {mockConflicts.length} Active
          </Badge>
        </div>
        <Button variant="outline">Resolve All</Button>
      </div>
      
      {mockConflicts.length > 0 ? (
        <div className="space-y-6">
          {mockConflicts.map(conflict => (
            <Card key={conflict.id} className="p-6 border-l-4 border-l-red-500">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <h3 className="text-lg font-semibold">
                  {getConflictMessage(conflict.type)}
                </h3>
                <Badge variant="outline" className="ml-2">
                  {conflict.date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {conflict.conflictingJobs.map((job, index) => (
                  <React.Fragment key={job.id}>
                    <div className="p-4 bg-gray-50 rounded-md">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium">{job.title}</h4>
                        <Badge className={`${getBadgeColor(job.type)} text-white`}>
                          {job.type.replace('-', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{job.time}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{job.location}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">Client: {job.client}</span>
                        </div>
                      </div>
                    </div>
                    
                    {index === 0 && (
                      <div className="flex items-center justify-center">
                        <div className="hidden lg:block">
                          <ArrowRight className="h-8 w-8 text-red-500" />
                        </div>
                        <div className="block lg:hidden">
                          <div className="w-full text-center text-red-500">
                            Conflicts with ↓
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
              
              <div className="mt-6 flex gap-3 justify-end">
                <Button variant="outline">Reschedule</Button>
                <Button variant="destructive">Resolve Conflict</Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-xl font-medium mb-2">No Schedule Conflicts</h3>
            <p className="text-gray-500 mb-4">Your schedule is optimized with no conflicts detected.</p>
          </div>
        </Card>
      )}
    </div>
  );
};

// Import this component at the top since it's used conditionally
import { CheckCircle } from 'lucide-react';

export default ScheduleConflicts;
