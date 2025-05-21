
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, CalendarDays, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatePickerWithRange } from './DatePickerWithRange';

interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  client: string;
  date: string;
  amount: number;
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'cheque' | 'other';
  status: 'processed' | 'pending' | 'failed';
  xeroSynced: boolean;
}

interface PaymentsManagementPanelProps {
  isXeroConnected: boolean;
}

const PaymentsManagementPanel: React.FC<PaymentsManagementPanelProps> = ({ isXeroConnected }) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ from: Date; to?: Date }>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date()
  });

  // Sample payments data
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'p1',
      invoiceId: '1',
      invoiceNumber: 'INV-2023-001',
      client: 'ABC Corporation',
      date: '2023-06-15',
      amount: 1250.00,
      method: 'bank_transfer',
      status: 'processed',
      xeroSynced: true
    },
    {
      id: 'p2',
      invoiceId: '4',
      invoiceNumber: 'INV-2023-004',
      client: 'Global Enterprises',
      date: '2023-07-05',
      amount: 1675.25,
      method: 'credit_card',
      status: 'processed',
      xeroSynced: true
    },
    {
      id: 'p3',
      invoiceId: '2',
      invoiceNumber: 'INV-2023-002',
      client: 'XYZ Ltd',
      date: '2023-07-10',
      amount: 450.00,
      method: 'credit_card',
      status: 'pending',
      xeroSynced: false
    },
  ]);

  // Filter payments
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.client.toLowerCase().includes(searchQuery.toLowerCase());
    
    const paymentDate = new Date(payment.date);
    const isInDateRange = 
      (!dateRange.from || paymentDate >= dateRange.from) && 
      (!dateRange.to || paymentDate <= dateRange.to);
    
    return matchesSearch && isInDateRange;
  });

  // Format amount
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  // Get payment method display
  const getPaymentMethodDisplay = (method: Payment['method']) => {
    switch (method) {
      case 'credit_card': return 'Credit Card';
      case 'bank_transfer': return 'Bank Transfer';
      case 'cash': return 'Cash';
      case 'cheque': return 'Cheque';
      case 'other': return 'Other';
    }
  };

  // Get status badge
  const getStatusBadge = (status: Payment['status']) => {
    switch(status) {
      case 'processed':
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
  };

  // Handle export payments
  const handleExportPayments = () => {
    toast({
      title: "Exporting payments",
      description: `${filteredPayments.length} payment records exported`,
      duration: 3000,
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Payments Management</CardTitle>
          <CardDescription>
            Manage and track all payment transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search payments..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <DatePickerWithRange 
                date={dateRange} 
                setDate={setDateRange} 
              />
              
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
                onClick={handleExportPayments}
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDays className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium">No payments found</h3>
              <p className="text-gray-500 mt-1">
                {searchQuery 
                  ? "Try adjusting your search criteria"
                  : "No payment records match your current filters"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Status</TableHead>
                    {isXeroConnected && <TableHead>Xero Status</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.invoiceNumber}</TableCell>
                      <TableCell>{payment.client}</TableCell>
                      <TableCell>{formatDate(payment.date)}</TableCell>
                      <TableCell>{getPaymentMethodDisplay(payment.method)}</TableCell>
                      <TableCell className="text-right font-medium">{formatAmount(payment.amount)}</TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      {isXeroConnected && (
                        <TableCell>
                          {payment.xeroSynced ? (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Synced</Badge>
                          ) : (
                            <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">Not Synced</Badge>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsManagementPanel;
