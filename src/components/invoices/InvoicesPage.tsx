
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  Download,
  Filter,
  Search,
  Printer,
  Mail,
  Plus,
  DollarSign,
  Calendar,
  Check,
  X,
  Clock,
  ChevronDown,
  Eye
} from 'lucide-react';

interface InvoicesPageProps {
  handleLogout?: () => void;
  userRole?: 'contractor' | 'business';
}

// Define invoice status type
type InvoiceStatus = 'paid' | 'pending' | 'overdue' | 'draft';

// Invoice interface
interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: InvoiceStatus;
}

const InvoicesPage = ({ 
  handleLogout = () => {}, 
  userRole = 'contractor' 
}: InvoicesPageProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'all' | InvoiceStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock invoices data
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-001',
      client: 'ABC Corporation',
      issueDate: '2023-06-01',
      dueDate: '2023-07-01',
      amount: 1250.00,
      status: 'paid'
    },
    {
      id: '2',
      invoiceNumber: 'INV-002',
      client: 'XYZ Ltd',
      issueDate: '2023-06-15',
      dueDate: '2023-07-15',
      amount: 850.50,
      status: 'pending'
    },
    {
      id: '3',
      invoiceNumber: 'INV-003',
      client: 'Tech Solutions',
      issueDate: '2023-05-20',
      dueDate: '2023-06-20',
      amount: 3400.75,
      status: 'overdue'
    },
    {
      id: '4',
      invoiceNumber: 'INV-004',
      client: 'Global Enterprises',
      issueDate: '2023-06-30',
      dueDate: '2023-07-30',
      amount: 1675.25,
      status: 'paid'
    },
    {
      id: '5',
      invoiceNumber: 'INV-005',
      client: 'SmallBiz Inc',
      issueDate: '2023-07-05',
      dueDate: '2023-08-05',
      amount: 525.00,
      status: 'draft'
    },
  ]);

  // Filter invoices based on active tab and search query
  const filteredInvoices = invoices.filter(invoice => {
    const matchesTab = activeTab === 'all' || invoice.status === activeTab;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Function to get status badge
  const getStatusBadge = (status: InvoiceStatus) => {
    switch(status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'draft':
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    }).format(date);
  };

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Handle download invoice
  const handleDownload = (id: string) => {
    toast({
      title: "Invoice downloaded",
      description: `Invoice #${id} has been downloaded`,
      duration: 3000,
    });
  };

  // Handle print invoice
  const handlePrint = (id: string) => {
    toast({
      title: "Preparing to print",
      description: `Invoice #${id} is ready for printing`,
      duration: 3000,
    });
  };

  // Handle send invoice
  const handleSend = (id: string) => {
    toast({
      title: "Invoice sent",
      description: `Invoice #${id} has been sent to the client`,
      duration: 3000,
    });
  };

  // Handle view invoice
  const handleViewInvoice = (id: string) => {
    toast({
      title: "Viewing invoice",
      description: `Opening invoice #${id} for viewing`,
      duration: 3000,
    });
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar 
        handleLogout={handleLogout}
        portalType={userRole}
      />
      
      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Invoices
          </h1>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              New Invoice
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search invoices..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | InvoiceStatus)} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="draft" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Draft
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Pending
            </TabsTrigger>
            <TabsTrigger value="paid" className="flex items-center gap-1">
              <Check className="h-4 w-4" />
              Paid
            </TabsTrigger>
            <TabsTrigger value="overdue" className="flex items-center gap-1">
              <X className="h-4 w-4" />
              Overdue
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">
                  {activeTab === 'all' 
                    ? 'All Invoices' 
                    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Invoices`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No invoices found</h3>
                    <p className="text-gray-500 mt-1">
                      {searchQuery 
                        ? "Try adjusting your search criteria"
                        : "Create your first invoice by clicking the 'New Invoice' button"}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[120px]">Invoice #</TableHead>
                          <TableHead>Client</TableHead>
                          <TableHead>Issue Date</TableHead>
                          <TableHead>Due Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredInvoices.map((invoice) => (
                          <TableRow key={invoice.id} className="cursor-pointer hover:bg-gray-50" onClick={() => handleViewInvoice(invoice.id)}>
                            <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                            <TableCell>{invoice.client}</TableCell>
                            <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                            <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                            <TableCell className="text-right font-medium">{formatAmount(invoice.amount)}</TableCell>
                            <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleViewInvoice(invoice.id); }}>
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleDownload(invoice.id); }}>
                                  <Download className="h-4 w-4" />
                                  <span className="sr-only">Download</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handlePrint(invoice.id); }}>
                                  <Printer className="h-4 w-4" />
                                  <span className="sr-only">Print</span>
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={(e) => { e.stopPropagation(); handleSend(invoice.id); }}>
                                  <Mail className="h-4 w-4" />
                                  <span className="sr-only">Send</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InvoicesPage;
