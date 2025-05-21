import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { DayClickEventHandler } from 'react-day-picker';

// Mock data
const mockEvents = [
  { id: 1, title: 'Test & Tag - Office Building', date: new Date(2023, 9, 5), type: 'test-tag' },
  { id: 2, title: 'RCD Testing - Warehouse', date: new Date(2023, 9, 8), type: 'rcd' },
  { id: 3, title: 'Emergency Lighting - Hotel', date: new Date(2023, 9, 12), type: 'emergency' },
  { id: 4, title: 'Thermal Imaging - Factory', date: new Date(2023, 9, 15), type: 'thermal' },
  { id: 5, title: 'Plumbing Inspection - Restaurant', date: new Date(2023, 9, 18), type: 'plumbing' },
  { id: 6, title: 'AC Maintenance - Office Complex', date: new Date(2023, 9, 22), type: 'ac' },
];

const ScheduleCalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  
  // Filter events for the selected date
  const eventsOnSelectedDate = selectedDate 
    ? mockEvents.filter(event => 
        event.date.getDate() === selectedDate.getDate() &&
        event.date.getMonth() === selectedDate.getMonth() &&
        event.date.getFullYear() === selectedDate.getFullYear()
      )
    : [];
  
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
  
  // Function to check if a date has events
  const hasEvents = (date: Date) => {
    return mockEvents.some(event => 
      event.date.getDate() === date.getDate() &&
      event.date.getMonth() === date.getMonth() &&
      event.date.getFullYear() === date.getFullYear()
    );
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="p-4 col-span-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">Calendar</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const prevMonth = new Date(month);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setMonth(prevMonth);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => {
                const nextMonth = new Date(month);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setMonth(nextMonth);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          month={month}
          onMonthChange={setMonth}
          className="rounded-md border pointer-events-auto"
          modifiers={{
            hasEvent: (date) => hasEvents(date)
          }}
          modifiersClassNames={{
            hasEvent: "font-semibold text-pretance-purple"
          }}
          components={{
            DayContent: ({ date }) => {
              const hasEventsOnDay = hasEvents(date);
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <div>{date.getDate()}</div>
                  {hasEventsOnDay && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-pretance-purple" />
                  )}
                </div>
              );
            }
          }}
        />
      </Card>
      
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium">
            {selectedDate?.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          <Button size="sm" className="bg-pretance-purple hover:bg-pretance-purple/80">
            <Plus className="h-4 w-4 mr-1" /> Add Job
          </Button>
        </div>
        
        {eventsOnSelectedDate.length > 0 ? (
          <div className="space-y-3">
            {eventsOnSelectedDate.map(event => (
              <div key={event.id} className="p-3 border rounded-md hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-medium">{event.title}</h3>
                  <Badge className={`${getBadgeColor(event.type)} text-white`}>
                    {event.type.replace('-', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {event.date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: true
                  })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-center">
            <p className="text-gray-500 mb-3">No jobs scheduled for this day</p>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-1" /> Schedule a Job
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ScheduleCalendarView;
