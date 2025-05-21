
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Thermometer, Calendar, Fan, Info, Clock } from 'lucide-react';
import { ACUnit } from './mockData';
import UnitDetailsDialog from './UnitDetailsDialog';

interface UnitsTabProps {
  units: ACUnit[];
}

const UnitsTab: React.FC<UnitsTabProps> = ({ units }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Operational':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Needs Service':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Filter Due':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Under Repair':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div>
      {units.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md border">
          <Fan className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No AC Units Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {units.map((unit) => (
            <Card key={unit.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-cyan-100">
                      <Thermometer className="h-4 w-4 text-cyan-700" />
                    </div>
                    <span>{unit.name}</span>
                  </div>
                  <Badge variant="outline" className={getStatusColor(unit.status)}>
                    {unit.status}
                  </Badge>
                </CardTitle>
                <p className="text-sm text-gray-500">{unit.location}</p>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Info className="h-3.5 w-3.5" /> Type:
                    </span>
                    <span>{unit.type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" /> Last Service:
                    </span>
                    <span>{new Date(unit.lastService).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> Filter Due:
                    </span>
                    <span>{new Date(unit.filterDueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <UnitDetailsDialog unit={unit} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UnitsTab;
