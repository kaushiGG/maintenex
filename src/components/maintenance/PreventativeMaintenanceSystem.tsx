import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  UserCog, 
  Users, 
  Database, 
  FileText, 
  Settings, 
  Shield,
  Calendar,
  ClipboardCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import MaintenanceChart from '@/components/dashboard/MaintenanceChart';

const PreventativeMaintenanceSystem = () => {
  const [activeTab, setActiveTab] = useState('user-management');

  const handleBackupNow = () => {
    toast.success('System backup initiated');
  };

  const handleRestoreBackup = () => {
    toast.info('Please select a backup file to restore');
  };

  const handleExportLogs = () => {
    toast.success('System logs exported successfully');
  };

  const handleApplySettings = () => {
    toast.success('Configuration settings updated');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-forgemate-purple">Forgemate Preventative Maintenance System</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Users className="mr-2 h-5 w-5 text-forgemate-purple" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">48</p>
            <p className="text-sm text-muted-foreground">Across all permission levels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ClipboardCheck className="mr-2 h-5 w-5 text-forgemate-purple" />
              Contractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">15</p>
            <p className="text-sm text-muted-foreground">With active portal access</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-forgemate-purple" />
              Last Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">2d ago</p>
            <p className="text-sm text-muted-foreground">Automatic system backup</p>
          </CardContent>
        </Card>
      </div>

      <MaintenanceChart />
      
      <div className="mt-6">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-6 grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="user-management" className="flex items-center">
              <UserCog className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">User Management</span>
              <span className="md:hidden">Users</span>
            </TabsTrigger>
            <TabsTrigger value="contractor-access" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Contractor Access</span>
              <span className="md:hidden">Access</span>
            </TabsTrigger>
            <TabsTrigger value="data-backup" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Data Backup & Restore</span>
              <span className="md:hidden">Backup</span>
            </TabsTrigger>
            <TabsTrigger value="system-logs" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">System Logs</span>
              <span className="md:hidden">Logs</span>
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Configuration Settings</span>
              <span className="md:hidden">Settings</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">Security Controls</span>
              <span className="md:hidden">Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="user-management">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage system users, permissions and access rights.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  From this panel, administrators can manage all user accounts within the system. 
                  You can add new users, edit existing profiles, assign roles, and set permission levels.
                </p>
                <Button 
                  className="bg-forgemate-purple hover:bg-forgemate-purple/90"
                  onClick={() => window.location.href = '/users'}
                >
                  Go to User Management
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="contractor-access">
            <Card>
              <CardHeader>
                <CardTitle>Contractor Access Control</CardTitle>
                <CardDescription>
                  Manage contractor portal access and permissions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Control which contractors have access to the system and what they can see or do. 
                  Set up individual permissions for each contractor based on their role and responsibilities.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="bg-forgemate-purple hover:bg-forgemate-purple/90"
                    onClick={() => window.location.href = '/contractors'}
                  >
                    Manage Contractors
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => toast.info('Access control audit will begin soon')}
                  >
                    Audit Access Controls
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data-backup">
            <Card>
              <CardHeader>
                <CardTitle>Data Backup & Restore</CardTitle>
                <CardDescription>
                  Manage system backups and restore capabilities.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Configure automated backup schedules, perform manual backups, 
                  and restore system data from previous backup points when needed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    className="bg-forgemate-purple hover:bg-forgemate-purple/90"
                    onClick={handleBackupNow}
                  >
                    Backup Now
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={handleRestoreBackup}
                  >
                    Restore From Backup
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Recent Backups</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>Automatic Backup</span>
                      <span className="text-gray-500">Oct. 20, 2023 - 03:00 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>Manual Backup</span>
                      <span className="text-gray-500">Oct. 18, 2023 - 11:45 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>Automatic Backup</span>
                      <span className="text-gray-500">Oct. 17, 2023 - 03:00 AM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="system-logs">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  View and export system activity logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Track system activities, user logins, configuration changes, and other critical events.
                  Logs can be filtered, searched, and exported for compliance and troubleshooting.
                </p>
                <div className="flex justify-end">
                  <Button 
                    className="bg-forgemate-purple hover:bg-forgemate-purple/90"
                    onClick={handleExportLogs}
                  >
                    Export Logs
                  </Button>
                </div>
                
                <div className="mt-4">
                  <h3 className="text-sm font-medium mb-2">Recent Activities</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>User Login: admin@forgemate.com</span>
                      <span className="text-gray-500">Today - 09:23 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>Configuration Change: Notification Settings</span>
                      <span className="text-gray-500">Today - 08:45 AM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>New User Added: john.doe@example.com</span>
                      <span className="text-gray-500">Yesterday - 04:12 PM</span>
                    </div>
                    <div className="flex justify-between items-center py-1 text-sm">
                      <span>Backup Completed</span>
                      <span className="text-gray-500">Oct. 20, 2023 - 03:01 AM</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="configuration">
            <Card>
              <CardHeader>
                <CardTitle>Configuration Settings</CardTitle>
                <CardDescription>
                  Customize system-wide settings and behaviors.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Configure system defaults, notification preferences, reporting parameters, 
                  and other key settings that determine how the system functions.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Email Notifications</h3>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="email_daily_summary" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="email_daily_summary" className="text-sm">Daily Summary</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="email_alerts" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="email_alerts" className="text-sm">Critical Alerts</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="email_maintenance" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="email_maintenance" className="text-sm">Maintenance Reminders</label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Data Retention</h3>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="retention_logs" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="retention_logs" className="text-sm">Keep Logs for 6 Months</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="retention_reports" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="retention_reports" className="text-sm">Archive Reports After 1 Year</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="retention_auto_clean" className="rounded text-forgemate-purple" />
                      <label htmlFor="retention_auto_clean" className="text-sm">Auto-Clean Temporary Files</label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button 
                    className="bg-forgemate-purple hover:bg-forgemate-purple/90"
                    onClick={handleApplySettings}
                  >
                    Apply Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Controls</CardTitle>
                <CardDescription>
                  Manage system security settings and protocols.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Configure password policies, authentication requirements,
                  session timeouts, and other security features to protect system integrity.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Authentication</h3>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="auth_2fa" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="auth_2fa" className="text-sm">Require Two-Factor Authentication</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="auth_password_complexity" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="auth_password_complexity" className="text-sm">Enforce Password Complexity</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="auth_password_expiry" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="auth_password_expiry" className="text-sm">90-Day Password Expiry</label>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Session Security</h3>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="session_timeout" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="session_timeout" className="text-sm">30-Minute Session Timeout</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="session_ip_lock" className="rounded text-forgemate-purple" />
                      <label htmlFor="session_ip_lock" className="text-sm">Lock Sessions to IP</label>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <input type="checkbox" id="session_concurrent" className="rounded text-forgemate-purple" defaultChecked />
                      <label htmlFor="session_concurrent" className="text-sm">Prevent Concurrent Logins</label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Security Audit</h3>
                  <Button 
                    variant="outline"
                    onClick={() => toast.info('Security audit started. This may take a few minutes.')}
                    className="w-full"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Run Security Audit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <div className="text-gray-600 space-y-4 py-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">System Information</h3>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span>System Version:</span>
                <span className="text-gray-700 font-medium">v2.3.1</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated:</span>
                <span className="text-gray-700 font-medium">3 days ago</span>
              </div>
              <div className="flex justify-between">
                <span>Database Status:</span>
                <span className="text-green-600 font-medium">Healthy</span>
              </div>
              <div className="flex justify-between">
                <span>User Login:</span>
                <span>admin@forgemate.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreventativeMaintenanceSystem;
