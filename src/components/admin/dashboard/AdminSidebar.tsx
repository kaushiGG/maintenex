import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Users,
  LayoutDashboard,
  Building,
  Settings,
  Package,
  BarChart,
  LayoutGrid,
  Gauge,
  UserCog,
  Shield,
  Wrench,
  Calendar,
  FileText,
  Bell
} from 'lucide-react';

interface AdminSidebarProps {
  activeTab: 'dashboard' | 'clients' | 'packages' | 'reports' | 'settings' | 
             'contractors' | 'sites' | 'schedule' | 'documents' | 'notifications' | 'billing';
  setActiveTab: (tab: 'dashboard' | 'clients' | 'packages' | 'reports' | 'settings' | 
                 'contractors' | 'sites' | 'schedule' | 'documents' | 'notifications' | 'billing') => void;
  switchRole: () => void;
}

const AdminSidebar = ({
  activeTab,
  setActiveTab,
  switchRole
}: AdminSidebarProps) => {
  const navigate = useNavigate();
  const [expandedMaintenance, setExpandedMaintenance] = useState(false);

  const getSidebarItemClass = (tab: typeof activeTab) => {
    return `p-3 ${
      activeTab === tab ? 'bg-forgemate-purple text-white' : 'bg-transparent hover:bg-forgemate-purple/20'
    } cursor-pointer flex items-center gap-3 rounded-md mb-1 transition-colors`;
  };

  return <div className="w-64 bg-gray-900 text-white h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-6">
        <Gauge className="text-forgemate-purple w-8 h-8" />
        <div>
          <h1 className="font-bold text-xl">Forgemate</h1>
          <p className="text-xs text-gray-400">Admin Portal</p>
        </div>
      </div>
      
      <div className={getSidebarItemClass('dashboard')} onClick={() => setActiveTab('dashboard')}>
        <LayoutDashboard size={18} />
        <span>Dashboard</span>
      </div>
      
      <div className={getSidebarItemClass('clients')} onClick={() => setActiveTab('clients')}>
        <Building size={18} />
        <span>Client Management</span>
      </div>
      
      <div className={getSidebarItemClass('contractors')} onClick={() => setActiveTab('contractors')}>
        <Users size={18} />
        <span>Contractors</span>
      </div>
      
      <div className={getSidebarItemClass('sites')} onClick={() => setActiveTab('sites')}>
        <Building size={18} />
        <span>Site Management</span>
      </div>
      
      <div className={getSidebarItemClass('schedule')} onClick={() => setActiveTab('schedule')}>
        <Calendar size={18} />
        <span>Schedule</span>
      </div>
      
      <div className={getSidebarItemClass('documents')} onClick={() => setActiveTab('documents')}>
        <FileText size={18} />
        <span>Documents</span>
      </div>
      
      <div className={getSidebarItemClass('notifications')} onClick={() => setActiveTab('notifications')}>
        <Bell size={18} />
        <span>Notifications</span>
      </div>
      
      <div className={getSidebarItemClass('billing')} onClick={() => setActiveTab('billing')}>
        <Package size={18} />
        <span>Billing & Packages</span>
      </div>
      
      <div className="p-3 hover:bg-forgemate-purple/20 cursor-pointer flex items-center justify-between rounded-md mb-1 transition-colors" 
           onClick={() => setExpandedMaintenance(!expandedMaintenance)}>
        <div className="flex items-center gap-3">
          <Wrench size={18} />
          <span>Maintenance</span>
        </div>
        <svg 
          className={`w-5 h-5 transition-transform ${expandedMaintenance ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      
      {expandedMaintenance && (
        <div className="ml-6 pl-4 border-l border-white/10 pb-2">
          <div className="p-2 hover:bg-forgemate-purple/20 cursor-pointer flex items-center gap-3 rounded-md mb-1" 
               onClick={() => toast.info("This feature is coming soon")}>
            <Shield size={16} />
            <span className="text-sm">System Maintenance</span>
          </div>
        </div>
      )}
      
      <div className={getSidebarItemClass('reports')} onClick={() => setActiveTab('reports')}>
        <BarChart size={18} />
        <span>Reports</span>
      </div>
      
      <div className={getSidebarItemClass('settings')} onClick={() => setActiveTab('settings')}>
        <Settings size={18} />
        <span>System Settings</span>
      </div>
      
      <Button onClick={switchRole} className="mt-4 p-3 bg-white/10 hover:bg-white/20 cursor-pointer flex items-center gap-3 rounded-md mb-1 transition-colors w-full justify-start">
        <LayoutGrid size={18} />
        <span>Go to Contractor Portal</span>
      </Button>

      <div className="mt-auto pt-6 border-t border-white/10 mt-6">
        <div className="bg-forgemate-purple/30 p-3 rounded-md">
          <p className="text-sm font-medium">Premium Plan</p>
          <p className="text-xs opacity-70">Your license is valid until:</p>
          <p className="text-sm">Oct 30, 2023</p>
          <Button variant="outline" size="sm" className="mt-2 w-full text-xs bg-white text-forgemate-purple hover:bg-white/90" onClick={() => toast.info("Viewing upgrade options")}>
            Upgrade Plan
          </Button>
        </div>
      </div>
    </div>;
};

export default AdminSidebar;
