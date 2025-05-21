
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Check, Link, RefreshCcw, Settings, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface XeroIntegrationPanelProps {
  isConnected: boolean;
  onConnect: () => void;
  onSync: () => void;
  isSynchronizing: boolean;
  lastSyncTime: string | null;
}

const XeroIntegrationPanel: React.FC<XeroIntegrationPanelProps> = ({
  isConnected,
  onConnect,
  onSync,
  isSynchronizing,
  lastSyncTime
}) => {
  const [xeroSettings, setXeroSettings] = useState({
    autoSync: true,
    syncFrequency: 'daily',
    syncInvoices: true,
    syncPayments: true,
    syncContacts: true,
    importInvoices: true
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Sync history demo data
  const syncHistory = [
    {
      id: '1',
      date: '2023-07-15T10:30:00',
      type: 'Automatic',
      status: 'success',
      details: 'Successfully synchronized 5 invoices and 3 payments'
    },
    {
      id: '2',
      date: '2023-07-14T09:15:00',
      type: 'Manual',
      status: 'success',
      details: 'Successfully synchronized 2 invoices and 1 payment'
    },
    {
      id: '3',
      date: '2023-07-13T14:45:00',
      type: 'Automatic',
      status: 'failed',
      details: 'Failed to connect to Xero API'
    }
  ];

  // Sync status text
  const getSyncStatusBadge = (status: string) => {
    if (status === 'success') {
      return <Badge className="bg-green-100 text-green-800">Success</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {!isConnected ? (
        <Card>
          <CardHeader>
            <CardTitle>Connect to Xero</CardTitle>
            <CardDescription>
              Integrate your invoicing system with your Xero account to synchronize invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center p-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 p-4 rounded-full inline-block">
                  <Link className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">Connect your Xero account</h3>
                <p className="text-gray-500 max-w-md">
                  Link your Xero account to automatically sync invoices, payments, and client information between systems.
                </p>
                <Button onClick={onConnect} className="mt-4">
                  Connect to Xero
                </Button>
              </div>
            </div>
            
            <Alert variant="default" className="bg-amber-50 border-amber-200 text-amber-800">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Required</AlertTitle>
              <AlertDescription>
                You'll need to authorize Forgemate to access your Xero account. You'll be redirected to Xero's authentication page.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl">Xero Integration Status</CardTitle>
                <CardDescription>
                  Manage your Xero connection and synchronization settings
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                Connected
              </Badge>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Last Synchronized</p>
                  <p className="text-lg font-semibold mt-1">{lastSyncTime ? formatDate(lastSyncTime) : 'Never'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Auto-Sync</p>
                  <p className="text-lg font-semibold mt-1">{xeroSettings.autoSync ? 'Enabled' : 'Disabled'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Sync Frequency</p>
                  <p className="text-lg font-semibold mt-1 capitalize">{xeroSettings.syncFrequency}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-500">Account Name</p>
                  <p className="text-lg font-semibold mt-1">Forgemate Business</p>
                </div>
              </div>
            
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">Synchronization Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync Invoices</p>
                      <p className="text-sm text-gray-500">Push invoices from Forgemate to Xero</p>
                    </div>
                    <div className="flex items-center">
                      {xeroSettings.syncInvoices ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync Payments</p>
                      <p className="text-sm text-gray-500">Push payments from Forgemate to Xero</p>
                    </div>
                    <div className="flex items-center">
                      {xeroSettings.syncPayments ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Sync Contacts</p>
                      <p className="text-sm text-gray-500">Synchronize client details with Xero contacts</p>
                    </div>
                    <div className="flex items-center">
                      {xeroSettings.syncContacts ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Import Invoices</p>
                      <p className="text-sm text-gray-500">Import invoices from Xero to Forgemate</p>
                    </div>
                    <div className="flex items-center">
                      {xeroSettings.importInvoices ? (
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Disabled</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Edit Settings
              </Button>
              <Button 
                onClick={onSync} 
                disabled={isSynchronizing}
                className="flex items-center gap-2"
              >
                {isSynchronizing ? (
                  <>
                    <RefreshCcw className="h-4 w-4 animate-spin" />
                    Synchronizing...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Synchronization History</CardTitle>
              <CardDescription>
                Recent synchronization activities between Forgemate and Xero
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncHistory.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.type}</TableCell>
                      <TableCell>{getSyncStatusBadge(record.status)}</TableCell>
                      <TableCell>{record.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default XeroIntegrationPanel;
