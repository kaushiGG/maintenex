import React, { useState, useEffect } from 'react';
import BusinessDashboard from '@/components/BusinessDashboard';
import ContractorDashboard from '@/components/ContractorDashboard';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const getUserRole = (): 'business' | 'contractor' => {
  const savedRole = localStorage.getItem('userRole');
  if (savedRole === 'business' || savedRole === 'contractor') {
    return savedRole as 'business' | 'contractor';
  }
  
  const role = 'business';
  localStorage.setItem('userRole', role);
  return role;
};

const Dashboard = () => {
  const [userRole, setUserRole] = useState<'business' | 'contractor' | null>(null);
  const [userMode, setUserMode] = useState<UserMode>('management');
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  useEffect(() => {
    const state = location.state as { switchMode?: UserMode } | null;
    
    if (state?.switchMode) {
      setUserMode(state.switchMode);
      
      navigate(location.pathname, { replace: true, state: {} });
    } else {
      const role = getUserRole();
      setUserRole(role);
      
      const savedMode = localStorage.getItem('userMode') as UserMode | null;
      if (savedMode === 'management' || savedMode === 'provider') {
        setUserMode(savedMode);
      }
    }
  }, [location, navigate]);
  
  // Check if the user has notifications and seed some using real data if they don't
  useEffect(() => {
    const checkAndGenerateNotifications = async () => {
      if (!user) return;
      
      try {
        // Check if the user has any notifications
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error checking notifications:', error);
          return;
        }
        
        // If the user has no notifications, generate some using real data
        if (count === 0) {
          console.log('No notifications found, generating with real data...');
          
          // Fetch real contractors
          const { data: contractors, error: contractorsError } = await supabase
            .from('contractors')
            .select('id, name, rating')
            .limit(5);
            
          if (contractorsError) {
            console.error('Error fetching contractors:', contractorsError);
            return;
          }
          
          // If no contractors found, can't generate notifications
          if (!contractors || contractors.length === 0) {
            console.log('No contractors found in database to generate notifications');
            return;
          }
          
          // Generate notifications based on real contractor data
          const notifications = [];
          
          // License expiration notification
          if (contractors[0]) {
            notifications.push({
              title: 'License Expiration Alert',
              message: JSON.stringify({
                text: `${contractors[0].name}'s license will expire soon`,
                actions: {
                  entityType: 'license',
                  entityId: contractors[0].id
                }
              }),
              type: 'alert',
              user_id: user.id,
              is_read: false,
              created_at: new Date().toISOString()
            });
          }
          
          // New contractor notification
          if (contractors[1]) {
            notifications.push({
              title: 'New Contractor Added',
              message: JSON.stringify({
                text: `${contractors[1].name} has been added to your contractor list`,
                actions: {
                  entityType: 'contractor',
                  entityId: contractors[1].id
                }
              }),
              type: 'system',
              user_id: user.id,
              is_read: false,
              created_at: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
            });
          }
          
          // Insurance document notification
          if (contractors[2]) {
            notifications.push({
              title: 'Insurance Document Required',
              message: JSON.stringify({
                text: `${contractors[2].name} needs to update their liability insurance`,
                actions: {
                  entityType: 'insurance',
                  entityId: contractors[2].id
                }
              }),
              type: 'alert',
              user_id: user.id,
              is_read: false,
              created_at: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
            });
          }
          
          // Job status notification
          if (contractors[3]) {
            notifications.push({
              title: 'Job Status Update',
              message: JSON.stringify({
                text: `Site maintenance by ${contractors[3].name} has been completed`,
                actions: {
                  jobId: contractors[3].id, // Using contractor ID as a job ID placeholder
                  status: 'completed'
                }
              }),
              type: 'job',
              user_id: user.id,
              is_read: false,
              created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            });
          }
          
          // Message notification
          if (contractors[4]) {
            notifications.push({
              title: 'Message from Contractor',
              message: JSON.stringify({
                text: `You have a new message from ${contractors[4].name} regarding the project`,
                actions: {
                  messageId: contractors[4].id,
                  threadId: 'thread-' + contractors[4].id
                }
              }),
              type: 'message',
              user_id: user.id,
              is_read: false,
              created_at: new Date(Date.now() - 172800000).toISOString() // 2 days ago
            });
          }
          
          // Create performance rating notification if we have contractors with ratings
          const contractorsWithRatings = contractors.filter(c => c.rating !== null);
          if (contractorsWithRatings.length > 0) {
            notifications.push({
              title: 'Performance Rating Update',
              message: JSON.stringify({
                text: `${contractorsWithRatings[0].name}'s performance rating has been updated`,
                actions: {
                  entityType: 'performance',
                  entityId: contractorsWithRatings[0].id
                }
              }),
              type: 'system',
              user_id: user.id,
              is_read: false,
              created_at: new Date(Date.now() - 259200000).toISOString() // 3 days ago
            });
          }
          
          // Insert generated notifications
          if (notifications.length > 0) {
            const { error: insertError } = await supabase
              .from('notifications')
              .insert(notifications);
              
            if (insertError) {
              console.error('Error inserting notifications:', insertError);
              toast.error('Failed to generate notifications');
            } else {
              console.log('Notifications with real data added successfully');
              toast.success('Notifications generated successfully');
            }
          }
        }
      } catch (error) {
        console.error('Error in checkAndGenerateNotifications:', error);
      }
    };
    
    checkAndGenerateNotifications();
  }, [user]);
  
  // Modified to remove the dashboard view toast
  const switchRole = () => {
    const newRole = userRole === 'business' ? 'contractor' : 'business';
    
    localStorage.setItem('userRole', newRole);
    setUserRole(newRole);
  };

  const switchMode = () => {
    const newMode = userMode === 'management' ? 'provider' : 'management';
    localStorage.setItem('userMode', newMode);
    setUserMode(newMode);
  };

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMode');
    
    navigate('/login');
  };
  
  if (!userRole) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#F3F0FF]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pretance-purple"></div>
      </div>
    );
  }
  
  // Separate the portals completely
  if (userRole === 'business') {
    return (
      <BusinessDashboard 
        switchRole={switchRole} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        userMode={userMode} 
        switchMode={switchMode} 
      />
    );
  } else {
    return (
      <ContractorDashboard 
        userRole="contractor" 
        handleLogout={handleLogout} 
      />
    );
  }
};

export default Dashboard;
