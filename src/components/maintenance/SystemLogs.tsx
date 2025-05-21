
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, Search, Filter, AlertCircle, InfoIcon, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Log, LogLevel } from '@/types/maintenance';

const SystemLogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  
  // Sample logs data
  const logs: Log[] = [
    { id: 1, user: 'admin@example.com', action: 'User Login', timestamp: '2023-10-25 08:32:15', ip: '192.168.1.45', details: 'Successful login from Chrome/Windows', level: 'info' },
    { id: 2, user: 'john.doe@example.com', action: 'Settings Updated', timestamp: '2023-10-25 09:15:23', ip: '192.168.1.50', details: 'System email notification settings updated', level: 'info' },
    { id: 3, user: 'system', action: 'Backup Failed', timestamp: '2023-10-24 23:05:11', ip: 'localhost', details: 'Automated backup job failed: Database connection error', level: 'error' },
    { id: 4, user: 'jane.smith@example.com', action: 'Permission Change', timestamp: '2023-10-24 16:45:33', ip: '192.168.1.72', details: 'User role changed from Operator to Manager', level: 'warning' },
    { id: 5, user: 'system', action: 'Service Restart', timestamp: '2023-10-24 03:10:05', ip: 'localhost', details: 'Application services automatically restarted after update', level: 'info' },
    { id: 6, user: 'mark.wilson@example.com', action: 'Failed Login Attempt', timestamp: '2023-10-23 15:22:08', ip: '209.85.128.101', details: 'Multiple failed login attempts detected', level: 'warning' },
    { id: 7, user: 'admin@example.com', action: 'User Deleted', timestamp: '2023-10-23 11:35:42', ip: '192.168.1.45', details: 'User account test.user@example.com permanently deleted', level: 'warning' },
    { id: 8, user: 'system', action: 'Database Error', timestamp: '2023-10-22 19:15:30', ip: 'localhost', details: 'Query timeout: Transaction rolled back after 30 seconds', level: 'error' },
  ];
  
  // Filter logs based on search query and level filter
  const filteredLogs = logs.filter(log => {
    const matchesQuery = 
      log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    
    return matchesQuery && matchesLevel;
  });
  
  const handleExportLogs = () => {
    console.log('Exporting logs...');
    // Implementation for exporting logs would go here
  };
  
  const getLevelBadge = (level: LogLevel) => {
    switch (level) {
      case 'info':
        return <Badge className="bg-blue-500"><InfoIcon className="h-3 w-3 mr-1" />Info</Badge>;
      case 'warning':
        return <Badge className="bg-amber-500"><AlertTriangle className="h-3 w-3 mr-1" />Warning</Badge>;
      case 'error':
        return <Badge className="bg-red-500"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">System Logs & Activity Tracking</h2>
          <p className="text-gray-500 mt-1">Monitor user actions, system events, and security incidents</p>
        </div>
        
        <Button 
          onClick={handleExportLogs} 
          className="bg-pretance-purple hover:bg-pretance-dark"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Logs
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search logs by user, action, or details..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="w-full sm:w-48">
              <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value as LogLevel | 'all')}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-pretance-purple/10">
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">{log.id}</TableCell>
                    <TableCell>{log.user}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>{getLevelBadge(log.level)}</TableCell>
                    <TableCell className="max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
                {filteredLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No logs found matching your criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
