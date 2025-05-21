
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { FileUp, FileDown, FileBarChart } from 'lucide-react';

interface TestHistoryItem {
  year: number;
  testsCompleted: number;
  passRate: string;
  failRate: string;
  warningRate: string;
  compliance: string;
}

interface TestHistoryTabProps {
  testHistory: TestHistoryItem[];
}

const TestHistoryTab: React.FC<TestHistoryTabProps> = ({ testHistory }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">RCD Testing History</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <FileUp className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
          <Button variant="outline" className="gap-1">
            <FileDown className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Tests Completed</TableHead>
              <TableHead>Pass Rate</TableHead>
              <TableHead>Fail Rate</TableHead>
              <TableHead>Warning Rate</TableHead>
              <TableHead>Compliance Rate</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testHistory.map(item => (
              <TableRow key={item.year}>
                <TableCell>{item.year}</TableCell>
                <TableCell>{item.testsCompleted}</TableCell>
                <TableCell>{item.passRate}</TableCell>
                <TableCell>{item.failRate}</TableCell>
                <TableCell>{item.warningRate}</TableCell>
                <TableCell>{item.compliance}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm">
                    <FileBarChart className="h-4 w-4 mr-1" />
                    View Report
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Year comparison callout */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-4">
          <p className="text-green-800">
            <strong>Positive Trend:</strong> Compliance rate has been consistently above 75% in the last three years, with more tests being conducted each year.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestHistoryTab;
