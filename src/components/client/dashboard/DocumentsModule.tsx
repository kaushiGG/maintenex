
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, GitBranch, Clock, FileOutput } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const DocumentsModule = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="repository">
        <TabsList className="mb-4">
          <TabsTrigger value="repository" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Repository
          </TabsTrigger>
          <TabsTrigger value="version" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Version Control
          </TabsTrigger>
          <TabsTrigger value="expiry" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Expiry Tracking
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileOutput className="h-4 w-4" />
            Report Generation
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="repository">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Document Repository</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                  <Input placeholder="Search documents..." className="pl-9" />
                </div>
                <Button>Upload</Button>
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Fire Safety Compliance 2023</div>
                    <span className="text-xs text-gray-500">Sep 15, 2023</span>
                  </div>
                  <div className="text-sm text-gray-500">PDF • 2.4 MB</div>
                </div>
                <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">Electrical Safety Standards</div>
                    <span className="text-xs text-gray-500">Aug 22, 2023</span>
                  </div>
                  <div className="text-sm text-gray-500">DOCX • 1.8 MB</div>
                </div>
                <div className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">HVAC Maintenance Procedure</div>
                    <span className="text-xs text-gray-500">Jul 30, 2023</span>
                  </div>
                  <div className="text-sm text-gray-500">PDF • 3.2 MB</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="version">
          <Card>
            <CardHeader>
              <CardTitle>Document Version Control</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Version control for procedures and requirements will be managed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expiry">
          <Card>
            <CardHeader>
              <CardTitle>Document Expiry Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Document expiry tracking will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Automated Report Generation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Automated report generation will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DocumentsModule;
