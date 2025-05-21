import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import BusinessDashboard from '@/components/BusinessDashboard';
import XeroIntegrationPanel from './XeroIntegrationPanel';
import PaymentsManagementPanel from './PaymentsManagementPanel';
import NewInvoiceDialog from './NewInvoiceDialog';
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
  Eye,
  RefreshCcw,
  CreditCard
} from 'lucide-react';

interface InvoicesAndPaymentsPageProps {
  switchRole?: () => void;
  userRole?: 'business' | 'contractor';
  handleLogout?: () => void;
}

// Demo invoice data
interface Invoice {
  id: string;
  invoiceNumber: string;
  client: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  xeroId?: string;
}

const InvoicesAndPaymentsPage = ({ 
  switchRole = () => {}, 
  userRole = 'business', 
  handleLogout = () => {} 
}: InvoicesAndPaymentsPageProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('invoices');
  const [invoiceListTab, setInvoiceListTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isConnectedToXero, setIsConnectedToXero] = useState(false);
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);

  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: '1',
      invoiceNumber: 'INV-2023-001',
      client: 'ABC Corporation',
      issueDate: '2023-06-01',
      dueDate: '2023-07-01',
      amount: 1250.00,
      status: 'paid',
      xeroId: 'XRO-INV-001'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2023-002',
      client: 'XYZ Ltd',
      issueDate: '2023-06-15',
      dueDate: '2023-07-15',
      amount: 850.50,
      status: 'pending',
      xeroId: 'XRO-INV-002'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-003',
      client: 'Tech Solutions',
      issueDate: '2023-05-20',
      dueDate: '2023-06-20',
      amount: 3400.75,
      status: 'overdue',
      xeroId: 'XRO-INV-003'
    },
    {
      id: '4',
      invoiceNumber: 'INV-2023-004',
      client: 'Global Enterprises',
      issueDate: '2023-06-30',
      dueDate: '2023-07-30',
      amount: 1675.25,
      status: 'paid'
    },
    {
      id: '5',
      invoiceNumber: 'INV-2023-005',
      client: 'SmallBiz Inc',
      issueDate: '2023-07-05',
      dueDate: '2023-08-05',
      amount: 525.00,
      status: 'draft'
    },
  ]);

  // Filter invoices based on active tab and search query
  const filteredInvoices = invoices.filter(invoice => {
    const matchesTab = invoiceListTab === 'all' || invoice.status === invoiceListTab;
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         invoice.client.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Get status badge
  const getStatusBadge = (status: 'paid' | 'pending' | 'overdue' | 'draft') => {
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

  // Handle connect to Xero
  const handleConnectToXero = () => {
    toast({
      title: "Connecting to Xero",
      description: "Redirecting to Xero authentication...",
      duration: 3000,
    });
    
    setTimeout(() => {
      setIsConnectedToXero(true);
      setLastSyncTime(new Date().toISOString());
      toast({
        title: "Connected to Xero",
        description: "Your Xero account has been successfully connected",
        duration: 3000,
      });
    }, 2000);
  };

  // Handle sync with Xero
  const handleSyncWithXero = () => {
    setIsSynchronizing(true);
    
    setTimeout(() => {
      setIsSynchronizing(false);
      setLastSyncTime(new Date().toISOString());
      toast({
        title: "Synchronization complete",
        description: "Your invoices have been synchronized with Xero",
        duration: 3000,
      });
    }, 2000);
  };

  // Handle new invoice creation
  const handleNewInvoice = () => {
    setShowNewInvoiceDialog(true);
  };

  const handleInvoiceCreated = (newInvoice: Invoice) => {
    setInvoices((prevInvoices) => [newInvoice, ...prevInvoices]);
  };

  return (
    <BusinessDashboard
      switchRole={switchRole}
      userRole={userRole}
      handleLogout={handleLogout}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Invoices & Payments
          </h1>
          
          <div className="flex items-center gap-2">
            {isConnectedToXero && (
              <div className="flex items-center mr-4">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" />
                  Connected to Xero
                </Badge>
                {lastSyncTime && (
                  <span className="text-xs text-gray-500 ml-2">
                    Last sync: {formatDate(lastSyncTime)}
                  </span>
                )}
              </div>
            )}
            <Button 
              variant={isConnectedToXero ? "outline" : "default"}
              size="sm"
              className="flex items-center gap-1"
              onClick={isConnectedToXero ? handleSyncWithXero : handleConnectToXero}
              disabled={isSynchronizing}
            >
              {isSynchronizing ? (
                <>
                  <RefreshCcw className="h-4 w-4 animate-spin" />
                  Synchronizing...
                </>
              ) : isConnectedToXero ? (
                <>
                  <RefreshCcw className="h-4 w-4" />
                  Sync with Xero
                </>
              ) : (
                <>
                  <CreditCard className="h-4 w-4" />
                  Connect to Xero
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-4">
          <TabsList className="grid grid-cols-3 w-[400px]">
            <TabsTrigger value="invoices" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Invoices
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="xero" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Xero Integration
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search invoices..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
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
                  onClick={handleNewInvoice}
                >
                  <Plus className="h-4 w-4" />
                  New Invoice
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all" value={invoiceListTab} onValueChange={setInvoiceListTab} className="w-full">
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
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium">
                    {invoiceListTab === 'all' 
                      ? 'All Invoices' 
                      : `${invoiceListTab.charAt(0).toUpperCase() + invoiceListTab.slice(1)} Invoices`}
                  </CardTitle>
                  <CardDescription>
                    {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''} found
                  </CardDescription>
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
                            <TableHead>Xero Status</TableHead>
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
                              <TableCell>
                                {invoice.xeroId ? (
                                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Synced</Badge>
                                ) : (
                                  <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Not Synced</Badge>
                                )}
                              </TableCell>
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
            </Tabs>
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            <PaymentsManagementPanel isXeroConnected={isConnectedToXero} />
          </TabsContent>

          <TabsContent value="xero" className="space-y-4">
            <XeroIntegrationPanel 
              isConnected={isConnectedToXero} 
              onConnect={handleConnectToXero} 
              onSync={handleSyncWithXero}
              isSynchronizing={isSynchronizing}
              lastSyncTime={lastSyncTime}
            />
          </TabsContent>
        </Tabs>

        <NewInvoiceDialog 
          open={showNewInvoiceDialog}
          onClose={() => setShowNewInvoiceDialog(false)}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </div>
    </BusinessDashboard>
  );
};

export default InvoicesAndPaymentsPage;
