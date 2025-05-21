import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, RefreshCw, Clock, Calendar, HardDrive, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Backup, BackupStatus } from '@/types/maintenance';

const DataBackupRestore = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("backups");
  const [selectedBackups, setSelectedBackups] = useState<number[]>([]);

  // Sample backup data
  const backups: Backup[] = [
    { id: 1, name: 'Full System Backup', date: '2023-10-01 08:30 AM', size: '2.4 GB', status: 'Completed', type: 'Full' },
    { id: 2, name: 'Weekly Incremental Backup', date: '2023-10-08 09:15 AM', size: '580 MB', status: 'Completed', type: 'Incremental' },
    { id: 3, name: 'Weekly Incremental Backup', date: '2023-10-15 09:10 AM', size: '620 MB', status: 'Completed', type: 'Incremental' },
    { id: 4, name: 'Database Backup', date: '2023-10-20 11:45 AM', size: '890 MB', status: 'Completed', type: 'Database' },
    { id: 5, name: 'Scheduled Backup (In Progress)', date: '2023-10-25 10:00 AM', size: 'N/A', status: 'In Progress', type: 'Full' },
    { id: 6, name: 'Failed Backup Attempt', date: '2023-10-22 02:15 AM', size: 'N/A', status: 'Failed', type: 'Incremental' },
  ];

  const handleBackupNow = () => {
    setLoading(true);
    toast.info('Starting backup process...');
    setTimeout(() => {
      setLoading(false);
      toast.success('Backup completed successfully');
    }, 3000);
  };

  const handleRestore = (id: number) => {
    toast.info(`Preparing to restore from backup ID: ${id}`);
    // Implement restore logic
  };

  const handleDownload = (id: number) => {
    toast.info(`Preparing backup ID: ${id} for download`);
    // Implement download logic
  };

  const toggleBackupSelection = (id: number) => {
    setSelectedBackups(prev => 
      prev.includes(id) 
        ? prev.filter(backupId => backupId !== id) 
        : [...prev, id]
    );
  };

  const getStatusBadge = (status: BackupStatus) => {
    switch (status) {
      case 'Completed':
        return <Badge className="bg-green-500">Completed</Badge>;
      case 'In Progress':
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'Failed':
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">Data Backup & Restore</h2>
          <p className="text-gray-500 mt-1">Manage system backups and data restoration options</p>
        </div>
        
        <Button 
          onClick={handleBackupNow} 
          className="bg-pretance-purple hover:bg-pretance-dark"
          disabled={loading}
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Backing up...
            </>
          ) : (
            <>
              <HardDrive className="mr-2 h-4 w-4" />
              Backup Now
            </>
          )}
        </Button>
      </div>
      
      <Tabs defaultValue="backups" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="backups">
            <FileText className="mr-2 h-4 w-4" />
            Backup History
          </TabsTrigger>
          <TabsTrigger value="schedule">
            <Calendar className="mr-2 h-4 w-4" />
            Backup Schedule
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Clock className="mr-2 h-4 w-4" />
            Retention Policies
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backup History</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-pretance-purple/10">
                    <TableHead className="w-[50px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.id}</TableCell>
                      <TableCell>{backup.name}</TableCell>
                      <TableCell>{backup.date}</TableCell>
                      <TableCell>{backup.size}</TableCell>
                      <TableCell>{backup.type}</TableCell>
                      <TableCell>{getStatusBadge(backup.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          {backup.status === 'Completed' && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDownload(backup.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRestore(backup.id)}
                              >
                                <Upload className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Backup Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Configure automated backup schedules and retention policies
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Schedule settings would go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Retention Policies</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Configure how long different types of backups are retained
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Retention policy settings would go here */}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataBackupRestore;
