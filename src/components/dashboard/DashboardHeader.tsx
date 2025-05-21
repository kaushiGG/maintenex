import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown, 
  Menu, 
  X, 
  Search,
  HelpCircle,
  MessageSquare,
  UserCog,
  AlertTriangle,
  Calendar,
  Briefcase,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';
import Logo from '@/components/Logo';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedNotification } from '@/types/notification';

interface DashboardHeaderProps {
  userRole: 'business' | 'contractor' | 'employee';
  userMode?: 'management' | 'provider';
  switchRole: (() => void) | null;
  handleLogout: () => void;
  switchMode?: () => void;
  isSidebarOpen?: boolean;
  toggleSidebar?: () => void;
  title?: string;  
  portalType?: string;  
  showBackButton?: boolean;  
  backTo?: string;  
  backText?: string;  
  userData?: {  
    fullName: string;
    email: string;
    userType: string;
  };
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  userRole, 
  userMode,
  switchRole, 
  handleLogout,
  switchMode,
  isSidebarOpen,
  toggleSidebar,
  title,  
  portalType,
  showBackButton,
  backTo,
  backText,
  userData
}) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState<ExtendedNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoading(false);
          return;
        }

        // Fetch recent notifications for this user
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }

        if (data) {
          // Process notifications to extract actions and description from message JSON
          const processedNotifications = data.map(notification => {
            try {
              // Ensure the type field is compatible with our type definition
              const notificationType = validateNotificationType(notification.type);
              
              // Try to parse the message as JSON
              let parsedMessage: any = notification.message;
              if (typeof notification.message === 'string') {
                try {
                  parsedMessage = JSON.parse(notification.message);
                } catch {
                  parsedMessage = { text: notification.message };
                }
              }
              
              // Extract text as description and any actions
              return {
                ...notification,
                type: notificationType,
                description: parsedMessage.text || notification.title,
                actions: parsedMessage.actions || {}
              } as ExtendedNotification;
            } catch (e) {
              console.error("Error processing notification:", e);
              // If parsing fails, use message as is for description
              return {
                ...notification,
                type: validateNotificationType(notification.type),
                description: typeof notification.message === 'string' ? notification.message : notification.title
              } as ExtendedNotification;
            }
          });

          setNotifications(processedNotifications);
        }
      } catch (error) {
        console.error('Error in fetchNotifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();

    // Set up a subscription for real-time notifications
    const notificationsSubscription = supabase
      .channel('notifications_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'notifications'
        }, 
        (payload) => {
          console.log('New notification received:', payload);
          fetchNotifications(); // Refresh notifications when a new one arrives
          toast.info('You have a new notification!');
        }
      )
      .subscribe();
      
    return () => {
      notificationsSubscription.unsubscribe();
    };
  }, []);

  // Helper function to validate notification type
  const validateNotificationType = (type: string | null): ExtendedNotification['type'] => {
    const validTypes: ExtendedNotification['type'][] = ['job', 'schedule', 'alert', 'message', 'system'];
    if (type && validTypes.includes(type as any)) {
      return type as ExtendedNotification['type'];
    }
    return 'system'; // Default fallback
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.info(`Searching for "${searchQuery}"`);
      // In a real app, this would trigger a search
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      // Update in Supabase
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
      
      // Navigate to relevant page based on notification type
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        // Handle navigation based on notification type and content
        if (notification.type === 'job' && notification.actions?.jobId) {
          navigate(`/jobs/${notification.actions.jobId}`);
        } else if (notification.type === 'alert' && notification.actions?.entityType === 'license') {
          navigate('/license-tracking');
        } else if (notification.type === 'alert' && notification.actions?.entityType === 'insurance') {
          navigate('/insurance-tracking');
        } else if (notification.type === 'message') {
          navigate('/messages');
        } else {
          navigate('/notifications');
        }
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast.error('Failed to update notification');
    }
  };

  const handleViewAllNotifications = () => {
    navigate('/notifications');
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleHelp = () => {
    toast.info('Help & Support', {
      description: 'Opening help documentation...'
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'job':
        return <Briefcase className="h-5 w-5 text-[#FF6B00]" />;
      case 'schedule':
        return <Calendar className="h-5 w-5 text-green-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-purple-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

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
      } else if (diffInSeconds < 604800) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch (e) {
      return 'Unknown time';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2 md:gap-4 lg:hidden">
        {toggleSidebar && (
          <Button variant="outline" size="icon" onClick={toggleSidebar}>
            {isSidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle Menu</span>
          </Button>
        )}
        <div className="flex items-center">
          <Logo size="sm" showText={true} className="h-8 w-auto" />
        </div>
      </div>
      
      {/* Brand for desktop view - always visible */}
      <div className="hidden lg:flex items-center">
        <Logo size="md" showText={true} className="h-10 w-auto" />
      </div>
      
      <div className="flex-1 ml-4">
        <form onSubmit={handleSearch} className="relative md:w-64 lg:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="pl-8 md:w-full bg-background"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={handleHelp} className="text-muted-foreground">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Help</span>
        </Button>
        
        {/* Mode switcher button - Desktop */}
        {switchMode && userMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={switchMode}
            className="hidden md:flex items-center gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
          >
            <UserCog className="h-4 w-4" />
            <span>{userMode === 'management' ? 'Provider Mode' : 'Management Mode'}</span>
          </Button>
        )}
        
        {/* Mode switcher button - Mobile */}
        {switchMode && userMode && (
          <Button
            variant="outline"
            size="icon"
            onClick={switchMode}
            className="md:hidden border-[#FF6B00]"
            title={`Switch to ${userMode === 'management' ? 'Provider' : 'Management'} Mode`}
          >
            <UserCog className="h-4 w-4 text-[#FF6B00]" />
          </Button>
        )}
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-[#FF6B00]" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-[#FF6B00]">
                  {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-sm">
            <div className="flex flex-col h-full">
              <div className="py-4 border-b">
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-sm text-muted-foreground">
                  You have {unreadCount} unread notifications
                </p>
              </div>
              <div className="flex-1 overflow-auto py-4">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF6B00]"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Bell className="h-8 w-8 text-[#FF6B00] mb-2" />
                    <h3 className="font-medium">No notifications</h3>
                    <p className="text-sm text-muted-foreground">
                      You're all caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.is_read ? 'bg-background hover:bg-accent' : 'bg-accent/50 hover:bg-accent'
                        }`}
                        onClick={() => handleNotificationClick(notification.id)}
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-grow">
                        <div className="flex justify-between items-start mb-1">
                              <h3 className={`font-medium ${!notification.is_read && 'text-[#FF6B00]'}`}>
                            {notification.title}
                          </h3>
                              {!notification.is_read && (
                                <div className="h-2 w-2 rounded-full bg-[#FF6B00]" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {notification.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                              {formatTime(notification.created_at)}
                        </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="py-4 border-t">
                <Button variant="outline" className="w-full" onClick={handleViewAllNotifications}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All Notifications
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1 md:gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>
                  {userData?.fullName ? 
                    `${userData.fullName.split(' ')[0][0]}${userData.fullName.split(' ')[1]?.[0] || ''}` : 
                    'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start text-sm">
                <span className="font-medium">{userData?.fullName || 'User'}</span>
                <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {switchMode && userMode && (
              <DropdownMenuItem onClick={switchMode}>
                <UserCog className="h-4 w-4 mr-2" />
                Switch to {userMode === 'management' ? 'Provider' : 'Management'} Mode
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;

