
import React, { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { plumbingAppliances } from './mockData';

const ComplianceCalendarTab: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  // Group appliances by next inspection date
  const appliancesByDate = plumbingAppliances.reduce((acc, appliance) => {
    const dateString = new Date(appliance.nextInspection).toDateString();
    if (!acc[dateString]) {
      acc[dateString] = [];
    }
    acc[dateString].push(appliance);
    return acc;
  }, {} as Record<string, typeof plumbingAppliances>);
  
  // Format dates for calendar highlighting
  const highlightedDates = Object.keys(appliancesByDate).map(dateString => new Date(dateString));
  
  // Get appliances for selected date
  const selectedDateString = date?.toDateString();
  const selectedDateAppliances = selectedDateString ? appliancesByDate[selectedDateString] || [] : [];
  
  // Calculate due inspections by month
  const currentDate = new Date();
  const nextThreeMonths = [
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 2, 1)
  ];
  
  const inspectionsByMonth = nextThreeMonths.map(monthDate => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    
    const appliancesThisMonth = plumbingAppliances.filter(appliance => {
      const nextInspection = new Date(appliance.nextInspection);
      return nextInspection.getFullYear() === year && nextInspection.getMonth() === month;
    });
    
    return {
      month: monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' }),
      count: appliancesThisMonth.length,
      appliances: appliancesThisMonth
    };
  });
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inspection Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow"
              modifiers={{
                highlighted: highlightedDates
              }}
              modifiersStyles={{
                highlighted: { backgroundColor: '#e5deff', color: '#8b5cf6', fontWeight: 'bold' }
              }}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Inspections</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {inspectionsByMonth.map((monthData, index) => (
                <div key={index}>
                  <h3 className="text-sm font-medium mb-2 flex justify-between">
                    <span>{monthData.month}</span>
                    <Badge variant="secondary">{monthData.count}</Badge>
                  </h3>
                  <ul className="space-y-2">
                    {monthData.appliances.slice(0, 3).map(appliance => (
                      <li key={appliance.id} className="text-sm">
                        <div className="flex justify-between">
                          <span>{appliance.name} ({appliance.type})</span>
                          <span className="text-gray-500">
                            {new Date(appliance.nextInspection).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">{appliance.location}</div>
                      </li>
                    ))}
                    {monthData.count > 3 && (
                      <li className="text-xs text-purple-600">
                        +{monthData.count - 3} more inspections...
                      </li>
                    )}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Selected Day</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateAppliances.length > 0 ? (
              <div className="space-y-3">
                <p className="text-sm font-medium">
                  {date?.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <ul className="space-y-2">
                  {selectedDateAppliances.map(appliance => (
                    <li key={appliance.id} className="border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                      <div className="text-sm font-medium">{appliance.name}</div>
                      <div className="text-xs">{appliance.type}</div>
                      <div className="text-xs text-gray-500">{appliance.location}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex h-20 items-center justify-center text-gray-500 text-sm">
                No inspections scheduled for this day
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceCalendarTab;
