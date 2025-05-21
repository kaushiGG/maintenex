
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Eye, Edit, Trash, FileText } from 'lucide-react';
import { PlumbingAppliance } from './mockData';
import ApplianceDetailsDialog from './ApplianceDetailsDialog';

interface AppliancesTabProps {
  appliances: PlumbingAppliance[];
}

const AppliancesTab: React.FC<AppliancesTabProps> = ({ appliances }) => {
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

  const handleViewDetails = (appliance: PlumbingAppliance) => {
    setSelectedAppliance(appliance);
    setDetailsOpen(true);
  };

  const handleEditAppliance = (id: string) => {
    toast({
      title: "Edit Functionality",
      description: "Edit functionality will be available in a future update"
    });
  };

  const handleGenerateReport = (id: string) => {
    toast({
      title: "Report Generated",
      description: "Appliance report has been generated and downloaded"
    });
  };

  const handleDeleteAppliance = (id: string) => {
    toast({
      title: "Delete Functionality",
      description: "Delete functionality will be available in a future update"
    });
  };

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Last Inspection</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appliances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  No appliances found
                </TableCell>
              </TableRow>
            ) : (
              appliances.map((appliance) => (
                <TableRow key={appliance.id}>
                  <TableCell>
                    <div className="font-medium">{appliance.name}</div>
                    <div className="text-xs text-gray-500">ID: {appliance.id}</div>
                  </TableCell>
                  <TableCell>{appliance.type}</TableCell>
                  <TableCell>{appliance.location}</TableCell>
                  <TableCell>{new Date(appliance.lastInspection).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(appliance.nextInspection).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(appliance.status)}`}>
                      {appliance.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(appliance)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAppliance(appliance.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleGenerateReport(appliance.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          Generate Report
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteAppliance(appliance.id)}
                          className="text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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

export default AppliancesTab;
