
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCircle, FormInput, Settings, Link } from 'lucide-react';

const ConfigurationModule = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="roles">
        <TabsList className="mb-4">
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <UserCircle className="h-4 w-4" />
            User Roles
          </TabsTrigger>
          <TabsTrigger value="forms" className="flex items-center gap-2">
            <FormInput className="h-4 w-4" />
            Forms Customization
          </TabsTrigger>
          <TabsTrigger value="workflow" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>User Role Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">User role customization will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="forms">
          <Card>
            <CardHeader>
              <CardTitle>Form and Field Customization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Form and field customization will be managed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Rule Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Workflow rule creation will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Integration management for accounting, messaging systems, etc. will be configured here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfigurationModule;
