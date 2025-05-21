// For NotificationsPage.tsx - we need to update it to handle the new notification format
// This is just a patch until the entire component can be refactored properly

import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedNotification } from '@/types/notification';
import { format } from 'date-fns';
import { 
  Bell, 
  Check,
  CheckCheck, 
  X, 
  Mail, 
  AlertTriangle, 
  Calendar,
  Clock,
  Trash2,
  Briefcase
} from 'lucide-react';
import { toast } from 'sonner';

interface NotificationsPageProps {
  handleLogout: () => void;
  userRole: string;
}

const NotificationsPage: React.FC<NotificationsPageProps> = ({ handleLogout, userRole }) => {
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast.error('Please log in to view notifications');
          setIsLoading(false);
          return;
        }

        // Fetch notifications for this user
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          console.log("Received notifications:", data);
          // Process notifications to extract actions and description from message JSON
          const processedNotifications = data.map(notification => {
            try {
              // Ensure the type field is compatible with our type definition
              const notificationType = validateNotificationType(notification.type);
              
              // Try to parse the message as JSON
              const parsedMessage = JSON.parse(notification.message);
              
              console.log("Parsed message:", parsedMessage);
              
              // Extract text as description and any actions
              return {
                ...notification,
                type: notificationType,
                description: parsedMessage.text || notification.message,
                actions: parsedMessage.actions || {}
              } as ExtendedNotification;
            } catch (e) {
              console.error("Error parsing notification message:", e);
              // If parsing fails, use message as is for description
              return {
                ...notification,
                type: validateNotificationType(notification.type),
                description: notification.message
              } as ExtendedNotification;
            }
          });

          console.log("Processed notifications:", processedNotifications);
          setNotifications(processedNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  // Helper function to validate notification type
  const validateNotificationType = (type: string | null): ExtendedNotification['type'] => {
    const validTypes: ExtendedNotification['type'][] = ['job', 'schedule', 'alert', 'message', 'system'];
    if (type && validTypes.includes(type as any)) {
      return type as ExtendedNotification['type'];
    }
    return 'system'; // Default fallback
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      
      toast.success('Notification marked as read');
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please log in to update notifications');
        return;
      }

      // Update all unread notifications for this user
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, is_read: true }))
      );
      
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to update notifications');
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      
      toast.success('Notification deleted');
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const handleJobAction = async (notification: ExtendedNotification, action: 'accept' | 'decline') => {
    if (!notification.actions?.jobId) {
      toast.error('Job information is missing');
      return;
    }

    try {
      // Update job status in the jobs table
      const { error: jobError } = await supabase
        .from('jobs')
        .update({ 
          status: action === 'accept' ? 'accepted' : 'declined'
        })
        .eq('id', notification.actions.jobId);

      if (jobError) throw jobError;

      // Mark the notification as read
      const { error: notifError } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id);

      if (notifError) throw notifError;

      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notification.id 
            ? { ...notif, is_read: true } 
            : notif
        )
      );

      toast.success(`Job ${action === 'accept' ? 'accepted' : 'declined'} successfully`);
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      toast.error(`Failed to ${action} job`);
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    const matchesFilter = filter === 'all' || notif.type === filter || 
      (filter === 'unread' && !notif.is_read);
      
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (notif.description && notif.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
    return matchesFilter && matchesSearch;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-5 w-5 text-blue-500" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <Mail className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-5xl py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Notifications</h1>
              <div className="flex space-x-2">
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all as read
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-wrap gap-2">
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'all' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('all')}
              >
                All
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'unread' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('unread')}
              >
                Unread
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'job' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('job')}
              >
                Jobs
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'schedule' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('schedule')}
              >
                Schedule
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'alert' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('alert')}
              >
                Alerts
              </button>
              <button 
                className={`px-3 py-1 rounded-full text-xs font-medium 
                  ${filter === 'message' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}
                onClick={() => setFilter('message')}
              >
                Messages
              </button>
            </div>
            
            <div className="mt-4">
              <input 
                type="text" 
                placeholder="Search notifications..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="divide-y">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-700"></div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="py-10 text-center text-gray-500">
                <Bell className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                <p>No notifications found</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 sm:p-6 ${!notification.is_read ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex">
                    <div className="flex-shrink-0 mr-4">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-xs text-gray-500 ml-2">
                          {formatDate(notification.created_at)}
                        </p>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.description}
                      </p>
                      
                      {notification.actions && notification.actions.jobId && (
                        <div className="mt-3 flex space-x-3">
                          {notification.actions.accept && (
                            <button 
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm flex items-center hover:bg-green-200"
                              onClick={() => handleJobAction(notification, 'accept')}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Accept
                            </button>
                          )}
                          {notification.actions.decline && (
                            <button 
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-md text-sm flex items-center hover:bg-red-200"
                              onClick={() => handleJobAction(notification, 'decline')}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Decline
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex-shrink-0 ml-4 flex flex-col">
                      {!notification.is_read && (
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center mb-2"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Check className="h-3 w-3 mr-1" />
                          Mark read
                        </button>
                      )}
                      <button 
                        className="text-xs text-red-600 hover:text-red-800 flex items-center"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="p-4 bg-gray-50 border-t border-gray-200 text-center text-sm text-gray-500">
            {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
