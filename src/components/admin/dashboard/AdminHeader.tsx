
import React, { useState } from 'react';
import { Bell, Search, Settings, LogOut, UserRound, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AdminSidebar from './AdminSidebar';

interface AdminHeaderProps {
  handleLogout: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notifications: Array<{
    id: number;
    message: string;
    time: string;
    read: boolean;
  }>;
}

const AdminHeader = ({
  handleLogout,
  searchQuery,
  setSearchQuery,
  notifications
}: AdminHeaderProps) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return <header className="bg-forgemate-purple h-16 px-4 flex items-center justify-between sticky top-0 z-20 shadow-md">
      <div className="flex items-center">
        <div className="block md:hidden mr-2">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0 text-white">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <AdminSidebar activeTab="dashboard" setActiveTab={() => {}} switchRole={() => {}} />
            </SheetContent>
          </Sheet>
        </div>
        <h1 className="text-white font-bold text-xl mr-8">Forgemate Business Portal</h1>
        
        <div className="hidden md:flex relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input placeholder="Search..." className="pl-8 bg-forgemate-purple/40 border-forgemate-purple/20 text-white placeholder:text-gray-400 w-64" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="relative p-2 text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                  {unreadCount}
                </span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-2 border-b">
              <h3 className="font-medium">Notifications</h3>
            </div>
            <div className="max-h-[300px] overflow-y-auto">
              {notifications.map(notification => <div key={notification.id} className={`p-3 border-b text-sm ${notification.read ? '' : 'bg-blue-50'}`}>
                  <p className="font-medium">{notification.message}</p>
                  <p className="text-gray-500 text-xs mt-1">{notification.time}</p>
                </div>)}
            </div>
            <div className="p-2 text-center border-t">
              <Button variant="link" className="text-xs">View all notifications</Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button variant="ghost" className="p-2 text-white">
          <Settings className="h-5 w-5" />
        </Button>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="p-1">
              <Avatar className="h-8 w-8">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin" alt="Admin" />
              </Avatar>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-0" align="end">
            <div className="p-3 border-b">
              <p className="font-medium">Admin User</p>
              <p className="text-sm text-gray-500">admin@forgemate.com</p>
            </div>
            <div className="p-2">
              <Button variant="ghost" className="w-full justify-start text-sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        
        <Button 
          variant="ghost" 
          className="hidden sm:flex items-center text-white hover:bg-forgemate-purple/80"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>;
};

export default AdminHeader;
