import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCheck, Download, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SafetyChecksHistoryProps {
  siteId: string;
}

const SafetyChecksHistory: React.FC<SafetyChecksHistoryProps> = ({ siteId }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Mock audit history data
  const auditHistory = [
    { 
      id: 1, 
      auditDate: '2024-02-15', 
      type: 'Comprehensive Safety Audit', 
      status: 'Completed', 
      findings: 3,
      compliance: '92%',
      auditor: 'John Smith',
      reportUrl: '#' 
    },
    { 
      id: 2, 
      auditDate: '2023-11-30', 
      type: 'Fire Safety Inspection', 
      status: 'Completed', 
      findings: 1,
      compliance: '96%',
      auditor: 'Sarah Johnson',
      reportUrl: '#' 
    },
    { 
      id: 3, 
      auditDate: '2023-08-12', 
      type: 'Workplace Hazard Assessment', 
      status: 'Completed', 
      findings: 5,
      compliance: '88%',
      auditor: 'Mike Williams',
      reportUrl: '#' 
    },
    { 
      id: 4, 
      auditDate: '2023-05-22', 
      type: 'Equipment Safety Check', 
      status: 'Completed', 
      findings: 0,
      compliance: '100%',
      auditor: 'John Smith',
      reportUrl: '#' 
    },
    { 
      id: 5, 
      auditDate: '2023-02-17', 
      type: 'Comprehensive Safety Audit', 
      status: 'Completed', 
      findings: 7,
      compliance: '85%',
      auditor: 'Sarah Johnson',
      reportUrl: '#' 
    },
  ];

  // Filter audits by search term and status
  const filteredAudits = auditHistory.filter(audit => {
    const matchesSearch = 
      audit.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      audit.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || audit.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesFilter;
  });

  const getComplianceBadgeColor = (compliance: string) => {
    const percentage = parseInt(compliance.replace('%', ''));
    if (percentage >= 95) return 'bg-green-100 text-green-800 hover:bg-green-100';
    if (percentage >= 85) return 'bg-blue-100 text-blue-800 hover:bg-blue-100'; 
    if (percentage >= 70) return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
    return 'bg-red-100 text-red-800 hover:bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search audits..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter Status</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in progress">In Progress</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-blue-500" />
            Safety Audit History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Auditor</TableHead>
                <TableHead>Findings</TableHead>
                <TableHead>Compliance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAudits.map(audit => (
                <TableRow key={audit.id}>
                  <TableCell className="font-medium">{audit.auditDate}</TableCell>
                  <TableCell>{audit.type}</TableCell>
                  <TableCell>{audit.auditor}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={audit.findings > 0 ? 'bg-yellow-50 text-yellow-800' : 'bg-green-50 text-green-800'}>
                      {audit.findings} {audit.findings === 1 ? 'issue' : 'issues'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getComplianceBadgeColor(audit.compliance)}>
                      {audit.compliance}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={audit.status === 'Completed' ? 'outline' : 'secondary'}>
                      {audit.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      View Report
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end mt-4">
        <Button className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Schedule New Audit
        </Button>
      </div>
    </div>
  );
};

export default SafetyChecksHistory; 