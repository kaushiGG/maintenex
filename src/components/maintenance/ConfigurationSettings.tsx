
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Sliders, Save, RefreshCw, Bell, Shield, Mail, Clock, Workflow, Users, File, Grid3X3 } from 'lucide-react';

const ConfigurationSettings = () => {
  const [loading, setLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState('3');
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [emailServer, setEmailServer] = useState('smtp.pretance.com');
  const [emailPort, setEmailPort] = useState('587');
  const [companyName, setCompanyName] = useState('Pretance Inc.');
  const [adminEmail, setAdminEmail] = useState('admin@pretance.com');
  
  const handleSaveSettings = () => {
    setLoading(true);
    
    // Simulate API request
    setTimeout(() => {
      setLoading(false);
      toast.success('Settings saved successfully');
    }, 1500);
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-pretance-purple">Configuration & Settings</h2>
          <p className="text-gray-500 mt-1">Manage system preferences, compliance rules, and notification settings</p>
        </div>
        
        <Button 
          onClick={handleSaveSettings} 
          disabled={loading}
          className="bg-pretance-purple hover:bg-pretance-dark"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save All Settings
            </>
          )}
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* General Settings */}
        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Sliders className="mr-2 h-5 w-5 text-pretance-purple" />
              General Settings
            </CardTitle>
            <CardDescription>Configure basic system settings and company information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 block">Company Name</label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Enter company name"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Admin Email</label>
                <Input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="Enter admin email"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Default Language</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Timezone</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  defaultValue="UTC+10:00"
                >
                  <option value="UTC-12:00">UTC-12:00</option>
                  <option value="UTC-11:00">UTC-11:00</option>
                  <option value="UTC-10:00">UTC-10:00</option>
                  <option value="UTC-09:00">UTC-09:00</option>
                  <option value="UTC-08:00">UTC-08:00 (PST)</option>
                  <option value="UTC-07:00">UTC-07:00 (MST)</option>
                  <option value="UTC-06:00">UTC-06:00 (CST)</option>
                  <option value="UTC-05:00">UTC-05:00 (EST)</option>
                  <option value="UTC-04:00">UTC-04:00</option>
                  <option value="UTC-03:00">UTC-03:00</option>
                  <option value="UTC-02:00">UTC-02:00</option>
                  <option value="UTC-01:00">UTC-01:00</option>
                  <option value="UTC+00:00">UTC+00:00 (GMT)</option>
                  <option value="UTC+01:00">UTC+01:00 (CET)</option>
                  <option value="UTC+02:00">UTC+02:00</option>
                  <option value="UTC+03:00">UTC+03:00</option>
                  <option value="UTC+04:00">UTC+04:00</option>
                  <option value="UTC+05:00">UTC+05:00</option>
                  <option value="UTC+05:30">UTC+05:30 (IST)</option>
                  <option value="UTC+06:00">UTC+06:00</option>
                  <option value="UTC+07:00">UTC+07:00</option>
                  <option value="UTC+08:00">UTC+08:00</option>
                  <option value="UTC+09:00">UTC+09:00 (JST)</option>
                  <option value="UTC+10:00">UTC+10:00 (AEST)</option>
                  <option value="UTC+11:00">UTC+11:00</option>
                  <option value="UTC+12:00">UTC+12:00</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Data Format</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  defaultValue="dd/mm/yyyy"
                >
                  <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                  <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                  <option value="yyyy/mm/dd">YYYY/MM/DD</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Currency</label>
                <select
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  defaultValue="aud"
                >
                  <option value="aud">AUD - Australian Dollar</option>
                  <option value="usd">USD - US Dollar</option>
                  <option value="eur">EUR - Euro</option>
                  <option value="gbp">GBP - British Pound</option>
                  <option value="jpy">JPY - Japanese Yen</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6">
              <label className="text-sm font-medium mb-1 block">System Message (Displayed on Login)</label>
              <Textarea 
                rows={3}
                placeholder="Enter a system-wide message that will be displayed to all users on login"
                defaultValue="Welcome to Pretance Maintenance System. This system is for authorized users only."
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Bell className="mr-2 h-5 w-5 text-pretance-purple" />
              Notification Settings
            </CardTitle>
            <CardDescription>Configure system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Enable Notifications</h4>
                  <p className="text-sm text-gray-500">Allow system to send notifications</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={notificationsEnabled}
                    onChange={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={emailNotifications}
                    onChange={() => setEmailNotifications(!emailNotifications)}
                    disabled={!notificationsEnabled}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 ${notificationsEnabled ? 'bg-gray-300' : 'bg-gray-200'} rounded-full peer ${notificationsEnabled && 'peer-checked:bg-pretance-purple'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white ${!notificationsEnabled && 'opacity-50'}`}></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">SMS Notifications</h4>
                  <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    checked={smsNotifications}
                    onChange={() => setSmsNotifications(!smsNotifications)}
                    disabled={!notificationsEnabled}
                    className="sr-only peer" 
                  />
                  <div className={`w-11 h-6 ${notificationsEnabled ? 'bg-gray-300' : 'bg-gray-200'} rounded-full peer ${notificationsEnabled && 'peer-checked:bg-pretance-purple'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white ${!notificationsEnabled && 'opacity-50'}`}></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-3">Notification Events</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="event-login" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-pretance-purple focus:ring-pretance-purple/25" 
                    />
                    <label htmlFor="event-login" className={`ml-2 text-sm ${!notificationsEnabled && 'text-gray-400'}`}>
                      User Login Attempts
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="event-backup" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-pretance-purple focus:ring-pretance-purple/25" 
                    />
                    <label htmlFor="event-backup" className={`ml-2 text-sm ${!notificationsEnabled && 'text-gray-400'}`}>
                      Backup Status
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="event-permissions" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-pretance-purple focus:ring-pretance-purple/25" 
                    />
                    <label htmlFor="event-permissions" className={`ml-2 text-sm ${!notificationsEnabled && 'text-gray-400'}`}>
                      Permission Changes
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="event-system" 
                      defaultChecked 
                      disabled={!notificationsEnabled}
                      className="h-4 w-4 rounded border-gray-300 text-pretance-purple focus:ring-pretance-purple/25" 
                    />
                    <label htmlFor="event-system" className={`ml-2 text-sm ${!notificationsEnabled && 'text-gray-400'}`}>
                      System Errors
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Shield className="mr-2 h-5 w-5 text-pretance-purple" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and authentication settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Max Failed Login Attempts</label>
                <Input
                  type="number"
                  min="1"
                  max="10"
                  value={loginAttempts}
                  onChange={(e) => setLoginAttempts(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Account will be locked after this many failed attempts</p>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Session Timeout (minutes)</label>
                <Input
                  type="number"
                  min="5"
                  max="240"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Users will be logged out after this period of inactivity</p>
              </div>
              
              <div className="flex items-center justify-between pt-4">
                <div>
                  <h4 className="font-medium">Enforce 2FA</h4>
                  <p className="text-sm text-gray-500">Require two-factor authentication</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Password Complexity</h4>
                  <p className="text-sm text-gray-500">Require strong passwords</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Email Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Mail className="mr-2 h-5 w-5 text-pretance-purple" />
              Email Configuration
            </CardTitle>
            <CardDescription>Setup email server settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Server</label>
                <Input
                  value={emailServer}
                  onChange={(e) => setEmailServer(e.target.value)}
                  placeholder="smtp.example.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">SMTP Port</label>
                <Input
                  value={emailPort}
                  onChange={(e) => setEmailPort(e.target.value)}
                  placeholder="587"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Email Username</label>
                <Input
                  placeholder="username@example.com"
                  defaultValue="notifications@pretance.com"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Email Password</label>
                <Input
                  type="password"
                  placeholder="••••••••••••"
                  defaultValue="password"
                />
              </div>
              
              <div className="flex items-center justify-between pt-2">
                <div>
                  <h4 className="font-medium">Use SSL/TLS</h4>
                  <p className="text-sm text-gray-500">Secure email connection</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => toast.success('Test email sent successfully')}
                >
                  Send Test Email
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Compliance Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <File className="mr-2 h-5 w-5 text-pretance-purple" />
              Compliance Settings
            </CardTitle>
            <CardDescription>Configure compliance and regulatory settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">GDPR Compliance</h4>
                  <p className="text-sm text-gray-500">Enable GDPR compliance features</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Data Retention Period (days)</label>
                <Input
                  type="number"
                  min="30"
                  defaultValue="365"
                />
                <p className="text-xs text-gray-500 mt-1">How long to keep user data and logs</p>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Audit Trail</h4>
                  <p className="text-sm text-gray-500">Record all changes for audit purposes</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Anonymization</h4>
                  <p className="text-sm text-gray-500">Anonymize personal data in reports</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* System Integration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-xl">
              <Workflow className="mr-2 h-5 w-5 text-pretance-purple" />
              System Integration
            </CardTitle>
            <CardDescription>Configure integrations with other systems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">API Access</h4>
                  <p className="text-sm text-gray-500">Enable external API access</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={true}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">CRM Integration</h4>
                  <p className="text-sm text-gray-500">Connect with CRM system</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Payment Gateway</h4>
                  <p className="text-sm text-gray-500">Enable payment processing</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input 
                    type="checkbox" 
                    defaultChecked={false}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-pretance-purple peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:border-white"></div>
                </label>
              </div>
              
              <div className="pt-4">
                <label className="text-sm font-medium mb-1 block">API Key</label>
                <div className="flex">
                  <Input
                    type="password"
                    defaultValue="sk_live_pretance_api_key_1234567890abcdef"
                    className="rounded-r-none"
                    readOnly
                  />
                  <Button 
                    variant="outline" 
                    className="rounded-l-none border-l-0"
                    onClick={() => toast.success('API key copied to clipboard')}
                  >
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">Use this key to authenticate API requests</p>
              </div>
              
              <div className="pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toast.success('API key regenerated')}
                  className="w-full"
                >
                  Regenerate API Key
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ConfigurationSettings;
