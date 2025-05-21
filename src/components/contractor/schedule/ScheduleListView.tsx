
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ArrowUpDown } from 'lucide-react';

// Mock data
const mockEvents = [
  { id: 1, title: 'Test & Tag - Office Building', date: new Date(2023, 9, 5), type: 'test-tag', client: 'ABC Corporation', status: 'scheduled' },
  { id: 2, title: 'RCD Testing - Warehouse', date: new Date(2023, 9, 8), type: 'rcd', client: 'XYZ Logistics', status: 'confirmed' },
  { id: 3, title: 'Emergency Lighting - Hotel', date: new Date(2023, 9, 12), type: 'emergency', client: 'Grand Hotel', status: 'scheduled' },
  { id: 4, title: 'Thermal Imaging - Factory', date: new Date(2023, 9, 15), type: 'thermal', client: 'Manufacturing Inc.', status: 'pending' },
  { id: 5, title: 'Plumbing Inspection - Restaurant', date: new Date(2023, 9, 18), type: 'plumbing', client: 'Fine Dining Ltd', status: 'confirmed' },
  { id: 6, title: 'AC Maintenance - Office Complex', date: new Date(2023, 9, 22), type: 'ac', client: 'Corporate Offices LLC', status: 'scheduled' },
];

const ScheduleListView = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Get badge color based on event type
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
  
  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Filter and sort events
  const filteredEvents = mockEvents
    .filter(event => {
      // Search by title and client
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            event.client.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by type
      const matchesType = filterType === 'all' || event.type === filterType;
      
      // Filter by status
      const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return a.date.getTime() - b.date.getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'client') {
        return a.client.localeCompare(b.client);
      }
      return 0;
    });
  
  return (
    <Card className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-xl font-medium">Jobs List</h2>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search jobs..." 
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Job Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="test-tag">Test & Tag</SelectItem>
                <SelectItem value="rcd">RCD Testing</SelectItem>
                <SelectItem value="emergency">Emergency Light</SelectItem>
                <SelectItem value="thermal">Thermal Imaging</SelectItem>
                <SelectItem value="plumbing">Plumbing</SelectItem>
                <SelectItem value="ac">AC Maintenance</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-36">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Job Title</SelectItem>
                <SelectItem value="client">Client</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => (
            <div key={event.id} className="p-4 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{event.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Client: {event.client}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge className={`${getBadgeColor(event.type)} text-white`}>
                    {event.type.replace('-', ' ')}
                  </Badge>
                  <Badge className={getStatusBadge(event.status)}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <p className="text-sm font-medium">
                  {event.date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })} at {event.date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
                <Button variant="outline" size="sm">View Details</Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No jobs match your search criteria</p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ScheduleListView;
