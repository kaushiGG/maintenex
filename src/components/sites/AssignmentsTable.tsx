
import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Site } from '@/types/site';

interface AssignmentsTableProps {
  sites: Site[];
  onSelect: (site: Site) => void;
  selectedSiteId?: string | null;
}

const AssignmentsTable: React.FC<AssignmentsTableProps> = ({ 
  sites,
  onSelect,
  selectedSiteId
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site Name</TableHead>
          <TableHead>Number of Contractors</TableHead>
          <TableHead>Assigned Contractors</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.length === 0 ? (
          <TableRow>
            <TableCell colSpan={3} className="text-center py-4">
              No sites found matching your search criteria
            </TableCell>
          </TableRow>
        ) : (
          sites.map((site) => (
            <TableRow 
              key={site.id}
              className={`cursor-pointer hover:bg-gray-50 ${selectedSiteId === site.id ? 'bg-[#7851CA]/10' : ''}`}
              onClick={() => onSelect(site)}
            >
              <TableCell className="font-medium">{site.name}</TableCell>
              <TableCell>{site.assignedContractors?.length || 0}</TableCell>
              <TableCell>
                {site.assignedContractors && site.assignedContractors.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {site.assignedContractors.slice(0, 3).map((contractor, idx) => (
                      <Badge 
                        key={idx} 
                        className="bg-[#7851CA] hover:bg-[#6a46b5]"
                      >
                        {contractor}
                      </Badge>
                    ))}
                    {site.assignedContractors.length > 3 && (
                      <Badge variant="outline">+{site.assignedContractors.length - 3} more</Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">No contractors assigned</span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default AssignmentsTable;
