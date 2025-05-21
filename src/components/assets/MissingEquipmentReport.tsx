
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, AlertTriangle, Download, Calendar } from 'lucide-react';

// Mock data for missing equipment
const missingEquipment = [
  {
    id: 'A1001',
    name: 'Fire Extinguisher',
    category: 'Safety',
    location: 'Floor 1, North Wing',
    lastSeen: '2023-10-15',
    reportedBy: 'John Smith',
    status: 'missing'
  },
  {
    id: 'A1045',
    name: 'Laptop Dell XPS',
    category: 'IT Equipment',
    location: 'Floor 2, Meeting Room 3',
    lastSeen: '2023-11-02',
    reportedBy: 'Sarah Johnson',
    status: 'missing'
  },
  {
    id: 'A2078',
    name: 'Projector',
    category: 'IT Equipment',
    location: 'Floor 3, Conference Room',
    lastSeen: '2023-09-28',
    reportedBy: 'Mike Thompson',
    status: 'found'
  },
  {
    id: 'A3012',
    name: 'Power Drill',
    category: 'Tools',
    location: 'Maintenance Room',
    lastSeen: '2023-10-30',
    reportedBy: 'David Wilson',
    status: 'missing'
  },
  {
    id: 'A4056',
    name: 'First Aid Kit',
    category: 'Safety',
    location: 'Floor 2, Kitchen',
    lastSeen: '2023-11-05',
    reportedBy: 'Emma Davis',
    status: 'found'
  }
];

interface MissingEquipmentReportProps {
  portalType: 'business' | 'contractor';
}

const MissingEquipmentReport = ({ portalType }: MissingEquipmentReportProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing' | 'found'>('all');
  
  const filteredEquipment = missingEquipment.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
          Missing Equipment Report
        </CardTitle>
        <CardDescription>
          Track and manage equipment reported as missing or misplaced
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by ID, name or location..."
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center rounded-md border px-3 py-1">
              <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
              <select 
                className="bg-transparent text-sm focus:outline-none"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as 'all' | 'missing' | 'found')}
              >
                <option value="all">All Status</option>
                <option value="missing">Missing</option>
                <option value="found">Found</option>
              </select>
            </div>
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Category</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="hidden lg:table-cell">Last Seen</TableHead>
              <TableHead className="hidden lg:table-cell">Reported By</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEquipment.length > 0 ? (
              filteredEquipment.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1 text-gray-500" />
                      {item.lastSeen}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">{item.reportedBy}</TableCell>
                  <TableCell>
                    <Badge
                      variant={item.status === 'missing' ? 'destructive' : 'default'}
                    >
                      {item.status === 'missing' ? 'Missing' : 'Found'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  No missing equipment found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {portalType === 'business' && (
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-md p-4">
            <h3 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Equipment Tracking Notice
            </h3>
            <p className="text-sm text-amber-700">
              Missing equipment should be reported within 24 hours of discovery. 
              Regular audits using QR code scanning can help prevent equipment loss.
              Equipment found should be updated promptly in the system.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MissingEquipmentReport;
