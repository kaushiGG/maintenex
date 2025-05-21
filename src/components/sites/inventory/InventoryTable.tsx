
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EquipmentItem } from '../types/equipment';
import { format } from 'date-fns';

interface InventoryTableProps {
  equipment: EquipmentItem[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ equipment }) => {
  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    try {
      return format(date, 'dd/MM/yyyy');
    } catch (e) {
      return 'Invalid date';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Name</TableHead>
            <TableHead className="font-semibold">Category</TableHead>
            <TableHead className="font-semibold">Location</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Last Serviced</TableHead>
            <TableHead className="font-semibold">Next Service</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {equipment.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                No equipment found matching your criteria
              </TableCell>
            </TableRow>
          ) : (
            equipment.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    item.status === 'operational' ? 'bg-green-100 text-green-800' :
                    item.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                </TableCell>
                <TableCell>{formatDate(item.lastServiced)}</TableCell>
                <TableCell>{formatDate(item.nextService)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InventoryTable;
