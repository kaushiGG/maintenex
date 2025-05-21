
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Shield, Lock, Users, Eye, EyeOff, KeyRound, ServerCrash, AlertTriangle } from 'lucide-react';

// Define the CheckIcon component with proper prop types
const CheckIcon: React.FC<React.HTMLAttributes<HTMLDivElement>> = (props) => (
  <div {...props} className={`h-5 w-5 rounded-full bg-green-100 flex items-center justify-center ${props.className || ''}`}>
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 3L4.5 8.5L2 6" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

const SecurityControls = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [passwordPolicyEnabled, setPasswordPolicyEnabled] = useState(true);
  const [ipRestrictionEnabled, setIpRestrictionEnabled] = useState(false);
  const [dataEncryptionEnabled, setDataEncryptionEnabled] = useState(true);
  const [auditLoggingEnabled, setAuditLoggingEnabled] = useState(true);
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">Security & Privacy Controls</h2>
          <p className="text-gray-500 mt-1">Manage system security settings and privacy controls</p>
        </div>
        
        <Button className="bg-pretance-purple hover:bg-pretance-dark">
          <Shield className="mr-2 h-4 w-4" />
          Run Security Audit
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lock className="mr-2 h-5 w-5 text-pretance-purple" />
              Authentication Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-gray-500">Require 2FA for all admin users</p>
                </div>
                <Switch
                  checked={twoFactorEnabled}
                  onCheckedChange={setTwoFactorEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Strong Password Policy</p>
                  <p className="text-sm text-gray-500">Require complex passwords, regular changes</p>
                </div>
                <Switch
                  checked={passwordPolicyEnabled}
                  onCheckedChange={setPasswordPolicyEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">IP Restriction</p>
                  <p className="text-sm text-gray-500">Limit access to specific IP addresses</p>
                </div>
                <Switch
                  checked={ipRestrictionEnabled}
                  onCheckedChange={setIpRestrictionEnabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Eye className="mr-2 h-5 w-5 text-pretance-purple" />
              Data Privacy Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Data Encryption</p>
                  <p className="text-sm text-gray-500">Encrypt sensitive data at rest</p>
                </div>
                <Switch
                  checked={dataEncryptionEnabled}
                  onCheckedChange={setDataEncryptionEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Audit Logging</p>
                  <p className="text-sm text-gray-500">Track all data access and changes</p>
                </div>
                <Switch
                  checked={auditLoggingEnabled}
                  onCheckedChange={setAuditLoggingEnabled}
                />
              </div>
              
              <div className="mt-4">
                <Button variant="outline" size="sm" className="w-full">
                  <KeyRound className="mr-2 h-4 w-4" />
                  Manage Encryption Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Users className="mr-2 h-5 w-5 text-pretance-purple" />
            Role-Based Access Controls
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-pretance-purple/10">
                <TableHead>Role</TableHead>
                <TableHead>User Management</TableHead>
                <TableHead>Site Access</TableHead>
                <TableHead>Financial Data</TableHead>
                <TableHead>Reports</TableHead>
                <TableHead>System Settings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Administrator</TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Manager</TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Supervisor</TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Operator</TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
                <TableCell><CheckIcon /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
                <TableCell><EyeOff className="h-4 w-4 text-gray-400" /></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <ServerCrash className="mr-2 h-5 w-5 text-pretance-purple" />
              Threat Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">Monitoring for suspicious activities and potential threats</p>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start mt-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-800">Recent Alert</p>
                  <p className="text-sm text-amber-700">
                    Multiple failed login attempts detected from IP 203.0.113.42 on Oct 12, 2023
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full">
                View All Security Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Shield className="mr-2 h-5 w-5 text-pretance-purple" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
              </div>
              <span className="text-sm font-medium">92%</span>
            </div>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckIcon />
                <span>Data encryption standards met</span>
              </li>
              <li className="flex items-start">
                <CheckIcon />
                <span>User access controls implemented</span>
              </li>
              <li className="flex items-start">
                <CheckIcon />
                <span>Regular security audits conducted</span>
              </li>
              <li className="flex items-start text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5" />
                <span>Password rotation policy needs updating</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SecurityControls;
