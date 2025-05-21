
import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Site } from '@/types/site';
import ContractorBadge from './ContractorBadge';

interface AssignmentsTableProps {
  sites: Site[];
  onOpenAssignDialog: (site: Site | null, contractorName?: string) => void;
  onDeleteContractor: (site: Site, contractorName: string) => void;
  isLoading: boolean;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({
  sites,
  onOpenAssignDialog,
  onDeleteContractor,
  isLoading
}) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="font-medium">Site Name</TableHead>
            <TableHead className="font-medium">Address</TableHead>
            <TableHead className="font-medium">Assigned Contractors</TableHead>
            <TableHead className="text-right font-medium">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700"></div>
                  <span className="ml-2">Loading site assignments...</span>
                </div>
              </TableCell>
            </TableRow>
          ) : sites.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-8">
                No sites found. Create sites to assign contractors.
              </TableCell>
            </TableRow>
          ) : (
            sites.map(site => (
              <TableRow key={site.id} className="border-b">
                <TableCell className="font-medium">{site.name}</TableCell>
                <TableCell className="text-gray-600">{site.address}</TableCell>
                <TableCell>
                  {site.assignedContractors && site.assignedContractors.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {site.assignedContractors.map((contractor, idx) => (
                        <ContractorBadge
                          key={idx} 
                          contractorName={contractor}
                          onEdit={() => onOpenAssignDialog(site, contractor)}
                          onDelete={() => onDeleteContractor(site, contractor)}
                        />
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">No contractors assigned</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onOpenAssignDialog(site)}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Assign
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignmentsTable;
