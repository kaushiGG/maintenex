
import React, { useState } from 'react';
import { 
  Users,
  Search,
  PlusCircle,
  Edit,
  Trash2,
  Filter,
  Building,
  Download,
  Upload,
  FileText,
  UserPlus,
  MapPin
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from '@/components/ui/badge';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

// Mock client data
const mockClients = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'Corporate',
    contact: 'John Smith',
    email: 'john@acmecorp.com',
    phone: '07 1234 5678',
    address: '123 Brisbane St, Brisbane QLD',
    locations: 3,
    activeJobs: 2,
    lastService: '2023-12-15',
    status: 'active'
  },
  {
    id: '2',
    name: 'TechSolutions Inc',
    type: 'Technology',
    contact: 'Sarah Johnson',
    email: 'sarah@techsolutions.com',
    phone: '02 9876 5432',
    address: '456 Sydney Rd, Sydney NSW',
    locations: 2,
    activeJobs: 1,
    lastService: '2024-01-10',
    status: 'active'
  },
  {
    id: '3',
    name: 'Global Enterprises',
    type: 'Retail',
    contact: 'Michael Lee',
    email: 'michael@globalent.com',
    phone: '03 8765 4321',
    address: '789 Melbourne Ave, Melbourne VIC',
    locations: 5,
    activeJobs: 0,
    lastService: '2023-11-05',
    status: 'inactive'
  },
  {
    id: '4',
    name: 'Innovative Systems',
    type: 'Healthcare',
    contact: 'Jessica Wang',
    email: 'jessica@innovativesys.com',
    phone: '08 2345 6789',
    address: '101 Perth St, Perth WA',
    locations: 1,
    activeJobs: 3,
    lastService: '2024-02-20',
    status: 'active'
  }
];

const ClientManagementUI = () => {
  const [clients, setClients] = useState(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  
  const form = useForm({
    defaultValues: {
      name: '',
      type: '',
      contact: '',
      email: '',
      phone: '',
      address: '',
    }
  });

  // Filter clients based on search query and selected tab
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      client.contact.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedTab === 'all') return matchesSearch;
    if (selectedTab === 'active') return matchesSearch && client.status === 'active';
    if (selectedTab === 'inactive') return matchesSearch && client.status === 'inactive';
    
    return matchesSearch;
  });

  const handleAddClient = (data: any) => {
    const newClient = {
      id: (clients.length + 1).toString(),
      name: data.name,
      type: data.type,
      contact: data.contact,
      email: data.email,
      phone: data.phone,
      address: data.address,
      locations: 0,
      activeJobs: 0,
      lastService: 'Never',
      status: 'active'
    };
    
    setClients([...clients, newClient]);
    setIsAddClientOpen(false);
    form.reset();
    
    toast.success('Client added successfully', {
      description: `${data.name} has been added to your client directory.`
    });
  };

  const handleEditClient = (clientId: string) => {
    toast.info(`Editing client ${clientId}`, {
      description: "This functionality will be implemented soon."
    });
  };

  const handleDeleteClient = (clientId: string) => {
    setClients(clients.filter(client => client.id !== clientId));
    
    toast.success('Client deleted successfully', {
      description: "The client has been removed from your directory."
    });
  };

  const handleExportData = () => {
    toast.info('Exporting client data', {
      description: "Your client data export is being prepared."
    });
  };

  const handleImportData = () => {
    toast.info('Import client data', {
      description: "This functionality will be implemented soon."
    });
  };

  const handleViewLocations = (clientId: string) => {
    toast.info(`Viewing locations for client ${clientId}`, {
      description: "This functionality will be implemented soon."
    });
  };

  const handleViewJobs = (clientId: string) => {
    toast.info(`Viewing jobs for client ${clientId}`, {
      description: "This functionality will be implemented soon."
    });
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Users className="mr-2 h-6 w-6 text-[#7851CA]" />
            Client Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage your clients and their associated data</p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <div className="relative w-full sm:w-64">
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
              <DropdownMenuItem onClick={() => setSelectedTab('all')}>
                All Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTab('active')}>
                Active Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedTab('inactive')}>
                Inactive Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Clients
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImportData}>
                <Upload className="h-4 w-4 mr-2" />
                Import Clients
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#7851CA] hover:bg-[#6a46b5]">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Fill in the details below to add a new client to your directory.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddClient)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter client name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Retail, Healthcare, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Person</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact phone" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Input placeholder="Main address" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-[#7851CA] hover:bg-[#6a46b5]">
                      Add Client
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Tabs defaultValue="all" value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Clients</TabsTrigger>
          <TabsTrigger value="active">Active Clients</TabsTrigger>
          <TabsTrigger value="inactive">Inactive Clients</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Client Directory</CardTitle>
          <CardDescription>
            Manage your clients, their locations, and related services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Client Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead className="hidden md:table-cell">Contact Info</TableHead>
                <TableHead className="hidden lg:table-cell">Address</TableHead>
                <TableHead>Locations</TableHead>
                <TableHead>Active Jobs</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No clients found matching your search criteria
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{client.name}</span>
                        <span className="text-xs text-gray-500">{client.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{client.contact}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-col text-sm">
                        <span>{client.email}</span>
                        <span>{client.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {client.address}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
                        onClick={() => handleViewLocations(client.id)}
                      >
                        <MapPin className="h-3.5 w-3.5 mr-1" />
                        {client.locations} locations
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 p-0"
                        onClick={() => handleViewJobs(client.id)}
                      >
                        {client.activeJobs}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={client.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}>
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditClient(client.id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteClient(client.id)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
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

export default ClientManagementUI;
