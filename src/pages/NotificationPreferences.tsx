import React, { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/BusinessDashboard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Bell, Mail, Smartphone, Calendar, ClipboardList, Users, Shield, AlertCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

// Completely bypass type checking for Supabase calls
// This is a temporary solution until you update your types properly
const db = {
  get: () => ({
    from: (table: string) => ({
      select: (columns: string) => ({
        eq: (field: string, value: any) => ({
          single: () => supabase.from(table as any).select(columns).eq(field, value).single()
        })
      }),
      insert: (data: any) => supabase.from(table as any).insert(data),
      update: (data: any) => ({
        eq: (field: string, value: any) => supabase.from(table as any).update(data).eq(field, value)
      })
    })
  })
}

const NotificationPreferences = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState({
    // Email notifications
    emailJobAssignments: true,
    emailJobUpdates: true,
    emailContractorUpdates: true,
    emailLicenseExpiry: true,
    emailInsuranceExpiry: true,
    emailDailyDigest: false,
    emailWeeklyReport: true,
    
    // Push notifications
    pushJobAssignments: true,
    pushJobUpdates: true,
    pushContractorUpdates: false,
    pushLicenseExpiry: true,
    pushInsuranceExpiry: true,
    pushRemindersDueToday: true,
    pushReminders24h: true,
    
    // SMS notifications
    smsJobAssignments: false,
    smsJobUpdates: false,
    smsLicenseExpiry: true,
    smsInsuranceExpiry: true,
    
    // Frequency settings
    digestFrequency: 'daily',
    reminderLeadTime: 7, // days
  });

  // Fetch user's notification preferences from Supabase
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Try to get existing preferences
        const { data, error } = await db.get()
          .from('notification_preferences')
          .select('settings')
          .eq('user_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching notification preferences:', error);
          
          // If not found, create a new preferences record
          if (error.code === 'PGRST116') {
            const { error: insertError } = await db.get()
              .from('notification_preferences')
              .insert({
                user_id: user.id
                // Default settings will be applied by the database
              });
              
            if (insertError) {
              console.error('Error creating notification preferences:', insertError);
              return;
            }
            
            // Preferences created with defaults, no need to update state
            toast.success('Notification preferences initialized');
          }
          return;
        }
        
        if (data && (data as any).settings) {
          setPreferences(prevPreferences => ({
            ...prevPreferences,
            ...(data as any).settings
          }));
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user]);

  // Handle toggle changes
  const handleToggle = async (key: string, value: any) => {
    if (!user) return;
    
    // Update local state immediately for responsive UI
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    
    const updatedSettings = {
      ...preferences,
      [key]: value
    };
    
    try {
      // Update in Supabase
      const { error } = await db.get()
        .from('notification_preferences')
        .update({
          settings: updatedSettings,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error updating preferences:', error);
        toast.error('Failed to save preferences');
        
        // Revert local state if update failed
        setPreferences(prev => ({
          ...prev,
          [key]: prev[key]
        }));
        return;
      }
      
      toast.success('Preferences updated');
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred');
    }
  };

  const NotificationItem = ({ 
    title, 
    description, 
    icon: Icon, 
    enabled, 
    prefKey 
  }: { 
    title: string; 
    description: string; 
    icon: any; 
    enabled: boolean; 
    prefKey: string; 
  }) => (
    <div className="flex items-center justify-between py-4 border-b border-[#333333]">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-[#FF6B00]/10 p-2">
          <Icon className="h-5 w-5 text-[#FF6B00]" />
        </div>
        <div>
          <h4 className="font-medium text-white">{title}</h4>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <Switch 
        checked={enabled} 
        onCheckedChange={(checked) => handleToggle(prefKey, checked)}
        className="data-[state=checked]:bg-[#FF6B00]" 
      />
    </div>
  );

  return (
    <BusinessDashboard 
      switchRole={null} 
      userRole="business" 
      handleLogout={() => {}}
    >
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2 text-black">Notification Preferences</h1>
          <p className="text-black">Customize how and when you receive notifications</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Email Notifications */}
          <Card className="border-[#333333] bg-[#121212] text-white shadow-lg">
            <CardHeader className="border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-[#FF6B00]" />
                <CardTitle>Email Notifications</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Configure email notifications and summaries</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <NotificationItem 
                title="Job Assignments" 
                description="Receive emails when new jobs are assigned" 
                icon={ClipboardList} 
                enabled={preferences.emailJobAssignments} 
                prefKey="emailJobAssignments" 
              />
              
              <NotificationItem 
                title="Job Updates" 
                description="Receive emails when job details are updated" 
                icon={ClipboardList} 
                enabled={preferences.emailJobUpdates} 
                prefKey="emailJobUpdates" 
              />
              
              <NotificationItem 
                title="Contractor Updates" 
                description="Receive emails when contractor information changes" 
                icon={Users} 
                enabled={preferences.emailContractorUpdates} 
                prefKey="emailContractorUpdates" 
              />
              
              <NotificationItem 
                title="License Expiry" 
                description="Receive emails when licenses are about to expire" 
                icon={Shield} 
                enabled={preferences.emailLicenseExpiry} 
                prefKey="emailLicenseExpiry" 
              />
              
              <NotificationItem 
                title="Insurance Expiry" 
                description="Receive emails when insurance policies are about to expire" 
                icon={Shield} 
                enabled={preferences.emailInsuranceExpiry} 
                prefKey="emailInsuranceExpiry" 
              />
              
              <NotificationItem 
                title="Daily Digest" 
                description="Receive a daily summary of activities" 
                icon={Calendar} 
                enabled={preferences.emailDailyDigest} 
                prefKey="emailDailyDigest" 
              />
              
              <NotificationItem 
                title="Weekly Report" 
                description="Receive a weekly summary and analytics report" 
                icon={Calendar} 
                enabled={preferences.emailWeeklyReport} 
                prefKey="emailWeeklyReport" 
              />
            </CardContent>
          </Card>

          {/* Push Notifications */}
          <Card className="border-[#333333] bg-[#121212] text-white shadow-lg">
            <CardHeader className="border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-[#FF6B00]" />
                <CardTitle>Push Notifications</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Configure in-app and browser notifications</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <NotificationItem 
                title="Job Assignments" 
                description="Receive push notifications when new jobs are assigned" 
                icon={ClipboardList} 
                enabled={preferences.pushJobAssignments} 
                prefKey="pushJobAssignments" 
              />
              
              <NotificationItem 
                title="Job Updates" 
                description="Receive push notifications when job details are updated" 
                icon={ClipboardList} 
                enabled={preferences.pushJobUpdates} 
                prefKey="pushJobUpdates" 
              />
              
              <NotificationItem 
                title="Contractor Updates" 
                description="Receive push notifications when contractor information changes" 
                icon={Users} 
                enabled={preferences.pushContractorUpdates} 
                prefKey="pushContractorUpdates" 
              />
              
              <NotificationItem 
                title="License Expiry" 
                description="Receive push notifications when licenses are about to expire" 
                icon={Shield} 
                enabled={preferences.pushLicenseExpiry} 
                prefKey="pushLicenseExpiry" 
              />
              
              <NotificationItem 
                title="Insurance Expiry" 
                description="Receive push notifications when insurance policies are about to expire" 
                icon={Shield} 
                enabled={preferences.pushInsuranceExpiry} 
                prefKey="pushInsuranceExpiry" 
              />
              
              <NotificationItem 
                title="Due Today Reminders" 
                description="Receive reminders for tasks due today" 
                icon={Clock} 
                enabled={preferences.pushRemindersDueToday} 
                prefKey="pushRemindersDueToday" 
              />
              
              <NotificationItem 
                title="24-Hour Reminders" 
                description="Receive reminders for tasks due in the next 24 hours" 
                icon={Clock} 
                enabled={preferences.pushReminders24h} 
                prefKey="pushReminders24h" 
              />
            </CardContent>
          </Card>

          {/* Mobile SMS Notifications */}
          <Card className="border-[#333333] bg-[#121212] text-white shadow-lg">
            <CardHeader className="border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#FF6B00]" />
                <CardTitle>SMS Notifications</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Configure text message alerts for critical updates</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <NotificationItem 
                title="Job Assignments" 
                description="Receive SMS when new jobs are assigned" 
                icon={ClipboardList} 
                enabled={preferences.smsJobAssignments} 
                prefKey="smsJobAssignments" 
              />
              
              <NotificationItem 
                title="Job Updates" 
                description="Receive SMS when job details are updated" 
                icon={ClipboardList} 
                enabled={preferences.smsJobUpdates} 
                prefKey="smsJobUpdates" 
              />
              
              <NotificationItem 
                title="License Expiry" 
                description="Receive SMS when licenses are about to expire" 
                icon={Shield} 
                enabled={preferences.smsLicenseExpiry} 
                prefKey="smsLicenseExpiry" 
              />
              
              <NotificationItem 
                title="Insurance Expiry" 
                description="Receive SMS when insurance policies are about to expire" 
                icon={Shield} 
                enabled={preferences.smsInsuranceExpiry} 
                prefKey="smsInsuranceExpiry" 
              />
            </CardContent>
          </Card>

          {/* Notification Priority */}
          <Card className="border-[#333333] bg-[#121212] text-white shadow-lg">
            <CardHeader className="border-b border-[#333333]">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-[#FF6B00]" />
                <CardTitle>Notification Priority</CardTitle>
              </div>
              <CardDescription className="text-gray-400">Control notification timing and frequency</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="bg-[#1A1A1A] p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Lead Time for Expiry Notices</h4>
                  <p className="text-sm text-gray-400 mb-3">Receive notifications before licenses/insurance expire</p>
                  <div className="flex flex-wrap gap-2">
                    {[3, 7, 14, 30].map(days => (
                      <Badge 
                        key={days}
                        className={`cursor-pointer text-white ${preferences.reminderLeadTime === days ? 'bg-[#FF6B00]' : 'bg-gray-700'}`}
                        onClick={() => handleToggle('reminderLeadTime', days)}
                      >
                        {days} days
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="bg-[#1A1A1A] p-4 rounded-lg">
                  <h4 className="font-medium text-white mb-2">Summary Digest Frequency</h4>
                  <p className="text-sm text-gray-400 mb-3">How often you receive activity summaries</p>
                  <div className="flex flex-wrap gap-2">
                    {['daily', 'weekly', 'biweekly', 'monthly'].map(frequency => (
                      <Badge 
                        key={frequency}
                        className={`cursor-pointer capitalize text-white ${preferences.digestFrequency === frequency ? 'bg-[#FF6B00]' : 'bg-gray-700'}`}
                        onClick={() => handleToggle('digestFrequency', frequency)}
                      >
                        {frequency}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 p-4 rounded bg-[#121212] border-l-4 border-[#FF6B00]">
          <p className="text-gray-300">
            <span className="text-[#FF6B00] font-semibold">Note:</span> Some notification types may be required for system administrators and cannot be disabled.
          </p>
        </div>
      </div>
    </BusinessDashboard>
  );
};

export default NotificationPreferences; 