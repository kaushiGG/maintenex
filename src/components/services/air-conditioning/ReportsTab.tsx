
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, Plus, Download, Filter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ServiceReport, ACUnit } from './mockData';
import CreateReportDialog from './CreateReportDialog';

interface ReportsTabProps {
  reports: ServiceReport[];
  units: ACUnit[];
}

const ReportsTab: React.FC<ReportsTabProps> = ({ reports, units }) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Sort reports by date (newest first)
  const sortedReports = [...reports].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const getUnitNameById = (unitId: string): string => {
    const unit = units.find(u => u.id === unitId);
    return unit ? unit.name : 'Unknown Unit';
  };

  const handleCreateReport = (unitId?: string) => {
    setSelectedUnitId(unitId || null);
    setShowCreateDialog(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">Service Reports</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => handleCreateReport()} className="gap-1 bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4" />
            Create Report
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card className="p-6 text-center">
          <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Service Reports</h3>
          <p className="text-gray-500 mb-4">Start by creating your first service report</p>
          <Button onClick={() => handleCreateReport()} className="mx-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Service Report
          </Button>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[100px]">Report ID</TableHead>
                <TableHead>AC Unit</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Technician</TableHead>
                <TableHead>Filter Replaced</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>{getUnitNameById(report.unitId)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-500" />
                      {new Date(report.date).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>{report.technicianName}</TableCell>
                  <TableCell>
                    {report.filterReplaced ? (
                      <span className="text-green-600">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <CreateReportDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        units={units}
        selectedUnitId={selectedUnitId}
      />
    </div>
  );
};

export default ReportsTab;
