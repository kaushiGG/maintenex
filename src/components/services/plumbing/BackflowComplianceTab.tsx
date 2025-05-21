
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileDown, Plus, Eye } from 'lucide-react';
import { PlumbingAppliance, getComplianceHistory } from './mockData';
import ApplianceDetailsDialog from './ApplianceDetailsDialog';

interface BackflowComplianceTabProps {
  backflowValves: PlumbingAppliance[];
}

const BackflowComplianceTab: React.FC<BackflowComplianceTabProps> = ({ backflowValves }) => {
  const { toast } = useToast();
  const [selectedAppliance, setSelectedAppliance] = useState<PlumbingAppliance | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'Non-Compliant':
        return 'bg-red-100 text-red-800';
      case 'Due Soon':
        return 'bg-yellow-100 text-yellow-800';
      case 'Overdue':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      compliant: 0,
      nonCompliant: 0,
      dueSoon: 0,
      overdue: 0
    };

    backflowValves.forEach(valve => {
      if (valve.status === 'Compliant') counts.compliant++;
      else if (valve.status === 'Non-Compliant') counts.nonCompliant++;
      else if (valve.status === 'Due Soon') counts.dueSoon++;
      else if (valve.status === 'Overdue') counts.overdue++;
    });

    return counts;
  };

  const counts = getStatusCounts();
  const totalValves = backflowValves.length;

  const handleRegisterTest = () => {
    toast({
      title: "Feature Coming Soon",
      description: "Test registration functionality will be available in the next release"
    });
  };

  const handleGenerateReport = () => {
    toast({
      title: "Report Generated",
      description: "Compliance report has been generated and downloaded"
    });
  };

  const handleViewDetails = (appliance: PlumbingAppliance) => {
    setSelectedAppliance(appliance);
    setDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Backflow Compliance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Compliant</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">{counts.compliant} of {totalValves}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${(counts.compliant / totalValves) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Due Soon</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">{counts.dueSoon} of {totalValves}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-yellow-500 rounded-full" 
                      style={{ width: `${(counts.dueSoon / totalValves) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overdue</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">{counts.overdue} of {totalValves}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-orange-500 rounded-full" 
                      style={{ width: `${(counts.overdue / totalValves) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Non-Compliant</span>
                <div className="flex items-center">
                  <span className="text-sm mr-2">{counts.nonCompliant} of {totalValves}</span>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-red-500 rounded-full" 
                      style={{ width: `${(counts.nonCompliant / totalValves) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Annual Compliance Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Backflow prevention devices must be tested annually by a licensed plumber to 
              ensure they are functioning correctly and maintain compliance with health and safety regulations.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleRegisterTest} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="mr-2 h-4 w-4" />
                Register New Test
              </Button>
              <Button onClick={handleGenerateReport} variant="outline">
                <FileDown className="mr-2 h-4 w-4" />
                Compliance Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Valve Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Test</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Certificate</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {backflowValves.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No backflow valves found
                </TableCell>
              </TableRow>
            ) : (
              backflowValves.map((valve) => {
                const complianceHistory = getComplianceHistory(valve.id);
                const latestCompliance = complianceHistory.length > 0 
                  ? complianceHistory.sort((a, b) => 
                      new Date(b.complianceDate).getTime() - new Date(a.complianceDate).getTime())[0]
                  : null;

                return (
                  <TableRow key={valve.id}>
                    <TableCell>
                      <div className="font-medium">{valve.name}</div>
                      <div className="text-xs text-gray-500">
                        {valve.manufacturer} {valve.model}
                      </div>
                    </TableCell>
                    <TableCell>{valve.location}</TableCell>
                    <TableCell>{new Date(valve.lastInspection).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(valve.nextInspection).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {latestCompliance ? (
                        <span className="text-sm">{latestCompliance.certificateNumber}</span>
                      ) : (
                        <span className="text-sm text-gray-500">No certificate</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(valve.status)}`}>
                        {valve.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleViewDetails(valve)}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {selectedAppliance && (
        <ApplianceDetailsDialog
          appliance={selectedAppliance}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />
      )}
    </div>
  );
};

export default BackflowComplianceTab;
