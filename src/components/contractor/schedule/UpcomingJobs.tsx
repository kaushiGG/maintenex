
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle } from 'lucide-react';

// Mock data
const mockUpcomingJobs = [
  { 
    id: 1, 
    title: 'Test & Tag - Office Building', 
    date: new Date(2023, 9, 5), 
    time: '9:00 AM - 12:00 PM',
    location: '123 Business St, Downtown',
    client: 'ABC Corporation',
    contact: 'John Smith',
    contactPhone: '(555) 123-4567',
    type: 'test-tag', 
    status: 'confirmed',
    notes: 'Access through the back entrance. Ask for security pass at reception.'
  },
  { 
    id: 2, 
    title: 'RCD Testing - Warehouse', 
    date: new Date(2023, 9, 8), 
    time: '2:00 PM - 5:00 PM',
    location: '456 Industrial Ave, West District',
    client: 'XYZ Logistics',
    contact: 'Mary Johnson',
    contactPhone: '(555) 987-6543',
    type: 'rcd', 
    status: 'confirmed',
    notes: 'Bring safety equipment. All testing to be done after hours.'
  },
  { 
    id: 3, 
    title: 'Emergency Lighting - Hotel', 
    date: new Date(2023, 9, 12), 
    time: '8:00 AM - 4:00 PM',
    location: '789 Hospitality Rd, Eastside',
    client: 'Grand Hotel',
    contact: 'Robert Williams',
    contactPhone: '(555) 246-8101',
    type: 'emergency', 
    status: 'pending',
    notes: 'Hotel will be operational. Work discreetly to avoid disturbing guests.'
  },
];

// Sort jobs by date (upcoming first)
const sortedJobs = [...mockUpcomingJobs].sort((a, b) => a.date.getTime() - b.date.getTime());

const UpcomingJobs = () => {
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium">Upcoming Jobs</h2>
        <Button variant="outline">View All Jobs</Button>
      </div>
      
      {sortedJobs.map(job => (
        <Card key={job.id} className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="text-lg font-semibold">{job.title}</h3>
                <Badge className={`${getBadgeColor(job.type)} text-white`}>
                  {job.type.replace('-', ' ')}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{job.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{job.time}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span>{job.location}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span>{job.contact} • {job.contactPhone}</span>
                </div>
              </div>
              
              {job.notes && (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-700"><span className="font-medium">Notes:</span> {job.notes}</p>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:items-end gap-4 mt-4 md:mt-0">
              <div className="flex items-center gap-2">
                {job.status === 'confirmed' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className={job.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}>
                  {job.status === 'confirmed' ? 'Confirmed' : 'Pending Confirmation'}
                </span>
              </div>
              
              <div className="flex flex-col gap-2 w-full md:w-auto">
                <Button className="bg-pretance-purple hover:bg-pretance-purple/80 w-full">
                  Start Job
                </Button>
                <Button variant="outline" className="w-full">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default UpcomingJobs;
