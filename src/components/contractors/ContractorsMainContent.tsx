
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

const dummyContractors = [
  { 
    id: 1, 
    name: 'ABC Fire Services', 
    serviceType: 'Fire Safety Systems', 
    credentials: 'All Valid', 
    status: 'Active',
    rating: 4 
  },
  { 
    id: 2, 
    name: 'Metro HVAC Solutions', 
    serviceType: 'Air Conditioning', 
    credentials: 'License Expiring', 
    status: 'Warning',
    rating: 3 
  },
  { 
    id: 3, 
    name: 'SafeExit Testing Co.', 
    serviceType: 'Emergency Systems', 
    credentials: 'Insurance Expired', 
    status: 'Suspended',
    rating: 2 
  },
  { 
    id: 4, 
    name: 'Reliable Electrical Services', 
    serviceType: 'Electrical Systems', 
    credentials: 'All Valid', 
    status: 'Active',
    rating: 5 
  },
  { 
    id: 5, 
    name: 'Secure Plumbing Co.', 
    serviceType: 'Plumbing Systems', 
    credentials: 'All Valid', 
    status: 'Active',
    rating: 4 
  }
];

const ContractorsMainContent = () => {
  return (
    <div>
      <div className="mb-6 bg-[#F6F5FF] p-4 rounded-md">
        <h2 className="text-lg font-medium mb-3 text-[#7851CA]">Filter Contractors</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Service Type</label>
            <select className="w-full p-2 border rounded-md">
              <option>Select service...</option>
              <option>Fire Safety</option>
              <option>Air Conditioning</option>
              <option>Emergency Systems</option>
              <option>Electrical</option>
              <option>Plumbing</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <Input placeholder="Enter location..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select className="w-full p-2 border rounded-md">
              <option>Minimum rating...</option>
              <option>★★★★★ (5)</option>
              <option>★★★★☆ (4+)</option>
              <option>★★★☆☆ (3+)</option>
              <option>★★☆☆☆ (2+)</option>
              <option>★☆☆☆☆ (1+)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select className="w-full p-2 border rounded-md">
              <option>Select status...</option>
              <option>Active</option>
              <option>Warning</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contractor</TableHead>
            <TableHead>Service Type</TableHead>
            <TableHead>Credentials</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dummyContractors.map((contractor) => (
            <TableRow key={contractor.id}>
              <TableCell className="font-medium">{contractor.name}</TableCell>
              <TableCell>{contractor.serviceType}</TableCell>
              <TableCell>{contractor.credentials}</TableCell>
              <TableCell>
                {contractor.status === 'Active' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-4 h-4 mr-1" /> Active
                  </span>
                )}
                {contractor.status === 'Warning' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="w-4 h-4 mr-1" /> Warning
                  </span>
                )}
                {contractor.status === 'Suspended' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-4 h-4 mr-1" /> Suspended
                  </span>
                )}
              </TableCell>
              <TableCell>
                {'★'.repeat(contractor.rating)}{'☆'.repeat(5 - contractor.rating)}
              </TableCell>
              <TableCell>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ContractorsMainContent;
