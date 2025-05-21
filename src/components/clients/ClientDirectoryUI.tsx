
import React, { useState } from 'react';
import { 
  Building,
  Search,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from 'sonner';

// Sample client data for provider view (simpler than the management view)
const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    contactPerson: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '07 1234 5678',
    address: '123 Brisbane St, Brisbane QLD',
    lastVisit: '2023-10-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'TechSolutions Inc',
    contactPerson: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '02 9876 5432',
    address: '456 Sydney Rd, Sydney NSW',
    lastVisit: '2023-11-22',
    status: 'active'
  },
  {
    id: '3',
    name: 'Global Enterprises',
    contactPerson: 'Michael Lee',
    email: 'michael@globalent.com',
    phone: '03 8765 4321',
    address: '789 Melbourne Ave, Melbourne VIC',
    lastVisit: '2024-01-05',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Innovative Systems',
    contactPerson: 'Jessica Wang',
    email: 'jessica@innovativesys.com',
    phone: '08 2345 6789',
    address: '101 Perth St, Perth WA',
    lastVisit: '2024-02-18',
    status: 'active'
  }
];

const ClientDirectoryUI = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Filter clients based on search query
  const filteredClients = mockClients.filter(client => 
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    client.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort clients based on selected field and direction
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (!sortField) return 0;
    
    const fieldA = a[sortField as keyof typeof a];
    const fieldB = b[sortField as keyof typeof b];
    
    if (typeof fieldA === 'string' && typeof fieldB === 'string') {
      return sortDirection === 'asc' 
        ? fieldA.localeCompare(fieldB) 
        : fieldB.localeCompare(fieldA);
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleViewDetails = (clientId: string) => {
    toast.info(`Viewing details for client ${clientId}`);
  };

  const handleContactClient = (clientId: string) => {
    toast.info(`Contacting client ${clientId}`);
  };

  const handleLogVisit = (clientId: string) => {
    toast.success(`Visit logged for client ${clientId}`);
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="mr-2 h-6 w-6 text-[#7851CA]" />
            Client Directory
          </h1>
          <p className="text-gray-500 mt-1">View and manage your assigned clients</p>
        </div>
        
        <div className="mt-4 sm:mt-0 w-full sm:w-auto flex space-x-2">
          <div className="relative flex-grow sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search clients..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSearchQuery('')}>
                All Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('active')}>
                Active Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('brisbane')}>
                Brisbane Area
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery('sydney')}>
                Sydney Area
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>My Clients</CardTitle>
          <CardDescription>
            Clients assigned to you for service and maintenance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] cursor-pointer" onClick={() => handleSort('name')}>
                  <div className="flex items-center">
                    Client Name
                    {sortField === 'name' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('contactPerson')}>
                  <div className="flex items-center">
                    Contact
                    {sortField === 'contactPerson' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden md:table-cell">Contact Info</TableHead>
                <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('address')}>
                  <div className="flex items-center">
                    Location
                    {sortField === 'address' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="hidden lg:table-cell cursor-pointer" onClick={() => handleSort('lastVisit')}>
                  <div className="flex items-center">
                    Last Visit
                    {sortField === 'lastVisit' && (
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No clients found matching your search criteria
                  </TableCell>
                </TableRow>
              ) : (
                sortedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{client.name}</span>
                      </div>
                      <Badge className={client.status === 'active' ? 'bg-green-500 mt-1' : 'bg-gray-500 mt-1'} variant="secondary">
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{client.contactPerson}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span className="text-sm">{client.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span className="text-sm">{client.phone}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span className="text-sm">{client.address}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                        <span className="text-sm">{client.lastVisit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(client.id)}
                        >
                          Details
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContactClient(client.id)}
                        >
                          Contact
                        </Button>
                        <Button
                          size="sm"
                          className="bg-[#7851CA] hover:bg-[#6a46b5]"
                          onClick={() => handleLogVisit(client.id)}
                        >
                          Log Visit
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientDirectoryUI;
