import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Search, ChevronDown, MoreHorizontal, CalendarPlus, Building, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate, useLocation } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Import mock data
import { plumbingAppliances, getBackflowValves } from './mockData';
import PlumbingStatusCard from './PlumbingStatusCard';
const PlumbingService: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('backflow');
  const [currentPage, setCurrentPage] = useState(1);
  const [locationFilter, setLocationFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('all');
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Parse query parameters
  const queryParams = new URLSearchParams(location.search);
  const siteId = queryParams.get('siteId') || '';
  const siteName = queryParams.get('siteName') || 'Selected Site';
  const siteAddress = queryParams.get('siteAddress') || '';

  // Redirect to landing page if no site is selected
  useEffect(() => {
    if (!siteId) {
      navigate('/services/landing/plumbing');
    }
  }, [siteId, navigate]);
  const handleScheduleService = () => {
    toast({
      title: "Service Scheduled",
      description: "A plumbing service has been scheduled"
    });
  };

  // Get data based on the selected category
  const backflowValves = getBackflowValves();

  // Calculate compliance data
  const compliancePercentage = Math.round(backflowValves.filter(valve => valve.status === 'Compliant').length / backflowValves.length * 100);
  const dueThisMonth = backflowValves.filter(valve => {
    const nextInspection = new Date(valve.nextInspection);
    const currentDate = new Date();
    return nextInspection.getMonth() === currentDate.getMonth() && nextInspection.getFullYear() === currentDate.getFullYear();
  }).length;
  const overdue = backflowValves.filter(valve => {
    const nextInspection = new Date(valve.nextInspection);
    const currentDate = new Date();
    return nextInspection < currentDate;
  }).length;

  // Filter items based on search query and filters
  const filteredItems = backflowValves.filter(valve => {
    // Apply search query
    const matchesSearch = valve.name.toLowerCase().includes(searchQuery.toLowerCase()) || valve.id.toLowerCase().includes(searchQuery.toLowerCase()) || valve.location.toLowerCase().includes(searchQuery.toLowerCase()) || valve.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());

    // Apply location filter
    const matchesLocation = locationFilter === 'all' || valve.location.toLowerCase().includes(locationFilter.toLowerCase());

    // Apply status filter
    const matchesStatus = statusFilter === 'all' || valve.status.toLowerCase() === statusFilter.toLowerCase();

    // Apply manufacturer filter
    const matchesManufacturer = manufacturerFilter === 'all' || valve.manufacturer.toLowerCase() === manufacturerFilter.toLowerCase();
    return matchesSearch && matchesLocation && matchesStatus && matchesManufacturer;
  });

  // Pagination
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'due soon':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  return <div className="p-6 max-w-7xl mx-auto">
      {/* Header with site information */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div>
          <Button variant="ghost" onClick={() => navigate('/services/landing/plumbing')} className="mb-2 -ml-2 text-violet-900">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sites
          </Button>
          
          <h1 className="text-2xl font-bold flex items-center text-purple-800">
            <Wrench className="h-6 w-6 mr-2 text-blue-600" />
            Plumbing Services
          </h1>
          <div className="flex items-center mt-1">
            <Building className="h-4 w-4 mr-1 text-gray-500" />
            <span className="text-gray-500">{siteName} • {siteAddress}</span>
          </div>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-5 gap-4 bg-white p-6 rounded-lg shadow-sm mb-6">
        <PlumbingStatusCard title="OVERALL COMPLIANCE" value={`${compliancePercentage}%`} color="bg-white" icon="CheckCircle" textColor="text-green-500" valueSize="text-4xl" />
        <PlumbingStatusCard title="TOTAL ASSETS" value={backflowValves.length.toString()} color="bg-white" icon="Wrench" textColor="text-gray-800" valueSize="text-4xl" />
        <PlumbingStatusCard title="DUE THIS MONTH" value={dueThisMonth.toString()} color="bg-white" icon="AlertCircle" textColor="text-amber-500" valueSize="text-4xl" />
        <PlumbingStatusCard title="OVERDUE" value={overdue.toString()} color="bg-white" icon="AlertCircle" textColor="text-red-500" valueSize="text-4xl" />
        <div className="flex items-center justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 w-full h-12" onClick={handleScheduleService}>
            <CalendarPlus className="mr-2 h-4 w-4" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          <Button variant={selectedCategory === 'backflow' ? 'default' : 'outline'} onClick={() => setSelectedCategory('backflow')} className={selectedCategory === 'backflow' ? 'bg-blue-600' : ''}>
            Backflow Valves
          </Button>
          <Button variant={selectedCategory === 'tmvs' ? 'default' : 'outline'} onClick={() => setSelectedCategory('tmvs')}>
            TMVs
          </Button>
          <Button variant={selectedCategory === 'hotwater' ? 'default' : 'outline'} onClick={() => setSelectedCategory('hotwater')}>
            Hot Water Systems
          </Button>
          <Button variant={selectedCategory === 'gas' ? 'default' : 'outline'} onClick={() => setSelectedCategory('gas')}>
            Gas Appliances
          </Button>
          <Button variant={selectedCategory === 'valveboxes' ? 'default' : 'outline'} onClick={() => setSelectedCategory('valveboxes')}>
            Valve Boxes
          </Button>
          <Button variant={selectedCategory === 'all' ? 'default' : 'outline'} onClick={() => setSelectedCategory('all')}>
            View All
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium">Filter by:</span>
          
          <div className="w-40">
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="basement">Basement</SelectItem>
                <SelectItem value="level">Level</SelectItem>
                <SelectItem value="roof">Roof</SelectItem>
                <SelectItem value="ground">Ground Floor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-40">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="compliant">Compliant</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="due soon">Due Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="w-40">
            <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Manufacturers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Manufacturers</SelectItem>
                <SelectItem value="conbraco">Conbraco</SelectItem>
                <SelectItem value="watts">Watts</SelectItem>
                <SelectItem value="febco">Febco</SelectItem>
                <SelectItem value="apollo">Apollo</SelectItem>
                <SelectItem value="zurn wilkins">Zurn Wilkins</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input placeholder="Search by ID, location, or description..." className="pl-9" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <Button onClick={() => setSearchQuery('')} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset ID</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead>Next Due</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedItems.length === 0 ? <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                    No items found matching your criteria
                  </TableCell>
                </TableRow> : paginatedItems.map(item => {
              const isOverdue = new Date(item.nextInspection) < new Date();
              const dueSoon = !isOverdue && new Date(item.nextInspection).getMonth() === new Date().getMonth();
              let status = item.status;
              let statusDisplay = status;
              let nextDueDisplay = new Date(item.nextInspection).toLocaleDateString();
              if (isOverdue) {
                statusDisplay = "Overdue";
                nextDueDisplay = `${nextDueDisplay} (Overdue)`;
              } else if (dueSoon) {
                statusDisplay = "Due Soon";
                nextDueDisplay = `${nextDueDisplay} (Due Soon)`;
              }
              return <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs">{item.id}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.location}</TableCell>
                      <TableCell>{item.manufacturer}</TableCell>
                      <TableCell>{new Date(item.lastInspection).toLocaleDateString()}</TableCell>
                      <TableCell className={isOverdue ? 'text-red-600' : dueSoon ? 'text-amber-600' : ''}>
                        {nextDueDisplay}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(statusDisplay)}`}>
                          {statusDisplay}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>;
            })}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
                
                {Array.from({
                length: Math.min(totalPages, 5)
              }).map((_, index) => {
                let pageNumber = index + 1;

                // Adjust page numbers for pagination with many pages
                if (totalPages > 5 && currentPage > 3) {
                  if (index === 0) {
                    pageNumber = 1;
                  } else if (index === 1 && currentPage > 4) {
                    return <PaginationItem key="ellipsis-start">
                          <PaginationEllipsis />
                        </PaginationItem>;
                  } else {
                    pageNumber = Math.min(currentPage + index - 2, totalPages);
                  }
                }
                return <PaginationItem key={pageNumber}>
                      <PaginationLink isActive={currentPage === pageNumber} onClick={() => setCurrentPage(pageNumber)}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>;
              })}
                
                {totalPages > 5 && currentPage < totalPages - 2 && <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>}
                
                {totalPages > 5 && currentPage < totalPages - 1 && <PaginationItem>
                    <PaginationLink onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>}
                
                <PaginationItem>
                  <PaginationNext onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>;
};
export default PlumbingService;