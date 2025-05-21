
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const topContractors = [
  { name: 'ABC Maintenance', serviceType: 'HVAC', rating: 4.9, lastService: '2 days ago', status: 'Active' },
  { name: 'SecureTech Systems', serviceType: 'Security', rating: 4.8, lastService: '1 week ago', status: 'Active' },
  { name: 'CleanPro Services', serviceType: 'Janitorial', rating: 4.7, lastService: '3 days ago', status: 'Active' },
  { name: 'PowerGrid Solutions', serviceType: 'Electrical', rating: 4.5, lastService: '2 weeks ago', status: 'Warning' },
];

interface ContractorPerformanceProps {
  className?: string;
}

const ContractorPerformance = ({ className }: ContractorPerformanceProps) => {
  return (
    <Card className={`shadow-sm hover:shadow transition-shadow ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-pretance-purple">Top Performing Contractors</CardTitle>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contractor</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Last Service</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topContractors.map((contractor, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{contractor.name}</TableCell>
                <TableCell>{contractor.serviceType}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <span className="font-semibold">{contractor.rating}</span>
                    <span className="text-yellow-500 ml-1">★</span>
                  </div>
                </TableCell>
                <TableCell>{contractor.lastService}</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      contractor.status === 'Active' 
                        ? 'bg-green-100 text-green-800 border-0' 
                        : 'bg-yellow-100 text-yellow-800 border-0'
                    }
                  >
                    {contractor.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ContractorPerformance;
