
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, AlertTriangle, CheckCircle2, FileText, Filter } from 'lucide-react';
import { ACUnit } from './mockData';

interface FiltersTabProps {
  units: ACUnit[];
}

const FiltersTab: React.FC<FiltersTabProps> = ({ units }) => {
  // Sort units by filter due date
  const sortedUnits = [...units].sort((a, b) => {
    return new Date(a.filterDueDate).getTime() - new Date(b.filterDueDate).getTime();
  });

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (dueDate: string) => {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Overdue ({Math.abs(daysUntilDue)} days)
        </Badge>
      );
    } else if (daysUntilDue <= 14) {
      return (
        <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Due Soon ({daysUntilDue} days)
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          OK ({daysUntilDue} days)
        </Badge>
      );
    }
  };

  const handleReplaceFilter = (unitId: string) => {
    console.log(`Replace filter for unit: ${unitId}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Filter Replacement Tracking</h2>
        <Button variant="outline" className="gap-1">
          <FileText className="h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="bg-cyan-50 border border-cyan-100 rounded-md p-4 mb-4">
        <div className="flex gap-2 items-center">
          <Filter className="h-5 w-5 text-cyan-700" />
          <span className="font-medium text-cyan-800">Filter Maintenance Guidelines</span>
        </div>
        <p className="text-sm text-cyan-700 mt-1">
          Regular filter replacement is essential for optimal AC performance. Replace filters every 3 months or when indicated by system performance.
        </p>
      </div>

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="w-[180px]">Unit ID</TableHead>
              <TableHead>Name & Location</TableHead>
              <TableHead className="text-right">Last Replaced</TableHead>
              <TableHead className="text-right">Next Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{unit.name}</div>
                    <div className="text-sm text-gray-500">{unit.location}</div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    {new Date(unit.filterLastReplaced).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Calendar className="h-3.5 w-3.5 text-gray-500" />
                    {new Date(unit.filterDueDate).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(unit.filterDueDate)}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReplaceFilter(unit.id)}
                    className="h-8"
                  >
                    Replace Filter
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default FiltersTab;
