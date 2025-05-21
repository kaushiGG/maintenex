
import React, { useState, useEffect } from 'react';
import NotificationsPage from '@/components/notifications/NotificationsPage';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client'; 
import { toast } from 'sonner';

const Notifications = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
  };

  // Fetch unread notifications count when component mounts
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
            
          if (error) {
            console.error('Error fetching notifications count:', error);
            return;
          }
          
          if (count !== null) {
            setUnreadCount(count);
            console.log(`User has ${count} unread notifications`);
          }
        } catch (err) {
          console.error('Error in notification count fetch:', err);
        }
      }
    };
    
    fetchUnreadCount();
    
    // Set up a subscription for real-time notifications
    const notificationsSubscription = supabase
      .channel('notifications_channel')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications',
          filter: user ? `user_id=eq.${user.id}` : undefined
        }, 
        (payload) => {
          console.log('New notification received:', payload);
          setUnreadCount(prev => prev + 1);
          toast.info('You have a new notification!');
        }
      )
      .subscribe();
      
    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, [user]);

  return (
    <NotificationsPage 
      handleLogout={handleLogout} 
      userRole="contractor" 
    />
  );
};

export default Notifications;
