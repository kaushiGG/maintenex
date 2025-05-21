import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, MessageSquare, ArrowUpRight, UsersRound, AlertTriangle, Shield, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Notification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  type: string;
  is_read: boolean;
}

interface ProcessedNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'warning' | 'critical' | 'success' | 'info';
  is_read: boolean;
}

const NotificationsModule = () => {
  const [notifications, setNotifications] = useState<ProcessedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) {
          console.error('Error fetching notifications:', error);
          toast.error('Failed to load notifications');
          return;
        }
        
        if (data) {
          // Process the notifications for display
          const processedNotifications = data.map(notification => processNotification(notification));
          setNotifications(processedNotifications);
        }
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
        toast.error('An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
    
    // Set up realtime subscription
    const notificationsSubscription = supabase
      .channel('dashboard_notifications')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: user ? `user_id=eq.${user.id}` : undefined
        }, 
        (payload) => {
          console.log('New dashboard notification:', payload);
          const newNotification = processNotification(payload.new as Notification);
          setNotifications(prev => [newNotification, ...prev].slice(0, 10));
        }
      )
      .subscribe();
      
    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, [user]);
  
  // Helper function to process notifications
  const processNotification = (notification: Notification): ProcessedNotification => {
    let notificationType: 'warning' | 'critical' | 'success' | 'info' = 'info';
    
    // Determine notification type based on content
    if (notification.type === 'alert') {
      notificationType = 'critical';
    } else if (notification.type === 'job') {
      notificationType = 'success';
    } else if (notification.type === 'schedule') {
      notificationType = 'warning';
    }
    
    // Try to extract description from message
    let description = notification.message;
    try {
      if (typeof notification.message === 'string') {
        const parsedMessage = JSON.parse(notification.message);
        if (parsedMessage.text) {
          description = parsedMessage.text;
        }
      }
    } catch (e) {
      // Use message as is if parsing fails
    }
    
    // Format the time
    const time = formatTime(notification.created_at);
    
    return {
      id: notification.id,
      title: notification.title,
      description,
      time,
      type: notificationType,
      is_read: notification.is_read
    };
  };
  
  // Format time helper
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        return 'Just now';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (diffInSeconds < 172800) { // 2 days
        return 'Yesterday';
      } else {
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
      }
    } catch (e) {
      return 'Unknown time';
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            All Notifications
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Communication Log
          </TabsTrigger>
          <TabsTrigger value="escalation" className="flex items-center gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Escalation Settings
          </TabsTrigger>
          <TabsTrigger value="bulk" className="flex items-center gap-2">
            <UsersRound className="h-4 w-4" />
            Bulk Notifications
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Alert Center</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                  <p className="text-gray-500">No notifications found</p>
                </div>
              ) : (
              <div className="space-y-4">
                {notifications.map((notification, index) => (
                    <div key={notification.id || index} className="flex items-start p-3 border rounded-md hover:bg-gray-50">
                      <div className="flex-shrink-0 mr-3 mt-1">
                        {notification.type === "warning" ? <Calendar className="h-5 w-5 text-amber-500" /> :
                         notification.type === "critical" ? <AlertTriangle className="h-5 w-5 text-red-500" /> :
                         notification.type === "success" ? <Shield className="h-5 w-5 text-green-500" /> :
                         <Bell className="h-5 w-5 text-blue-500" />}
                      </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{notification.title}</span>
                        <Badge className={
                          notification.type === "warning" ? "bg-yellow-100 text-yellow-800 border-0" :
                          notification.type === "critical" ? "bg-red-100 text-red-800 border-0" :
                          notification.type === "success" ? "bg-green-100 text-green-800 border-0" :
                          "bg-blue-100 text-blue-800 border-0"
                        }>
                          {notification.type}
                        </Badge>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-blue-500 ml-auto"></div>
                          )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Communication Log</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Communication history with contractors will be displayed here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="escalation">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Configure escalation settings for critical issues here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="bulk">
          <Card>
            <CardHeader>
              <CardTitle>Bulk Notification Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Configure and send bulk notifications here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationsModule;
