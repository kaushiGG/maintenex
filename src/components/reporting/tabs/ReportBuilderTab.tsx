
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FileCog } from 'lucide-react';

const ReportBuilderTab: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Report Builder</CardTitle>
        <CardDescription>
          Build your own custom reports with the data you need
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 border rounded-md p-4">
            <h3 className="font-medium mb-3">Data Sources</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch id="compliance-data" />
                <label htmlFor="compliance-data">Compliance Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="contractor-data" />
                <label htmlFor="contractor-data">Contractor Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="service-data" />
                <label htmlFor="service-data">Service Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="site-data" />
                <label htmlFor="site-data">Site Data</label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="equipment-data" />
                <label htmlFor="equipment-data">Equipment Data</label>
              </div>
            </div>
            
            <h3 className="font-medium mt-6 mb-3">Filters</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Date Range</label>
                <Select defaultValue="last30">
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last7">Last 7 days</SelectItem>
                    <SelectItem value="last30">Last 30 days</SelectItem>
                    <SelectItem value="last90">Last 90 days</SelectItem>
                    <SelectItem value="year">This year</SelectItem>
                    <SelectItem value="custom">Custom range</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm text-gray-500 mb-1 block">Sites</label>
                <Select defaultValue="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Select sites" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sites</SelectItem>
                    <SelectItem value="brisbane">Brisbane Office</SelectItem>
                    <SelectItem value="sydney">Sydney HQ</SelectItem>
                    <SelectItem value="melbourne">Melbourne Branch</SelectItem>
                    <SelectItem value="perth">Perth Office</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="col-span-8 border rounded-md p-4">
            <h3 className="font-medium mb-3">Report Layout</h3>
            <div className="bg-gray-50 p-6 rounded border-2 border-dashed min-h-[300px] flex flex-col items-center justify-center text-center">
              <FileCog className="h-12 w-12 text-gray-400 mb-3" />
              <h4 className="text-lg font-medium">Build Your Custom Report</h4>
              <p className="text-gray-500 mb-4 max-w-md">
                Select data sources and filters from the left panel to start building your custom report.
                Drag and drop elements to arrange your report layout.
              </p>
              <Button>
                Start Building
              </Button>
            </div>
            
            <div className="mt-6 flex justify-between">
              <Button variant="outline">
                Save as Template
              </Button>
              <div className="space-x-2">
                <Button variant="outline">Preview</Button>
                <Button>Generate Report</Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportBuilderTab;
