
import React, { useState } from 'react';
import AdminHeader from './admin/dashboard/AdminHeader';
import AdminSidebar from './admin/dashboard/AdminSidebar';
import TabContent from './admin/dashboard/TabContent';
import { useNavigate } from 'react-router-dom';

interface AdminDashboardProps {
  handleLogout: () => void;
  switchRole: () => void;
}

const AdminDashboard = ({ handleLogout, switchRole }: AdminDashboardProps) => {
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 
    'clients' | 
    'packages' | 
    'reports' | 
    'settings' | 
    'contractors' | 
    'sites' | 
    'schedule' | 
    'documents' | 
    'notifications' | 
    'billing'
  >('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  const notifications = [
    { id: 1, message: "New client registration", time: "10 minutes ago", read: false },
    { id: 2, message: "System update scheduled", time: "1 hour ago", read: false },
    { id: 3, message: "Billing report generated", time: "3 hours ago", read: true },
    { id: 4, message: "New support ticket", time: "Yesterday", read: true },
    { id: 5, message: "Contractor certification expiring", time: "2 days ago", read: false },
    { id: 6, message: "Compliance report ready", time: "3 days ago", read: true },
  ];

  const subscriptionData = [
    { name: 'Basic', value: 25, color: '#9b87f5' },
    { name: 'Standard', value: 45, color: '#7851CA' },
    { name: 'Premium', value: 30, color: '#5E3CA0' },
  ];

  const revenueData = [
    { name: 'Jan', value: 85000 },
    { name: 'Feb', value: 92000 },
    { name: 'Mar', value: 89000 },
    { name: 'Apr', value: 95000 },
    { name: 'May', value: 102000 },
    { name: 'Jun', value: 118000 },
    { name: 'Jul', value: 110000 },
    { name: 'Aug', value: 125000 },
    { name: 'Sep', value: 127850 },
    { name: 'Oct', value: 0 },
    { name: 'Nov', value: 0 },
    { name: 'Dec', value: 0 },
  ];

  const recentActivities = [
    { message: "New client onboarded: MediaCorp", time: "3h ago", type: "success" },
    { message: "Billing cycle completed", time: "6h ago", type: "success" },
    { message: "System update v2.4.1 deployed", time: "Yesterday", type: "info" },
    { message: "Database backup completed", time: "Yesterday", type: "info" },
    { message: "Contractor certification expired: ABC Electric", time: "2 days ago", type: "warning" },
    { message: "Site compliance status updated: Brisbane Office", time: "3 days ago", type: "info" },
  ];

  const systemAlerts = [
    { message: "Server load reached 85%", level: "warning" },
    { message: "3 failed login attempts detected", level: "warning" },
    { message: "Disk space below 15% on backup server", level: "critical" },
    { message: "5 contractor certifications expiring in 30 days", level: "warning" },
    { message: "2 sites with compliance issues detected", level: "critical" },
  ];

  // New compliance status data
  const complianceData = [
    { site: "Brisbane Office", status: "compliant", score: 98, lastAudit: "2023-09-15" },
    { site: "Sydney HQ", status: "warning", score: 82, lastAudit: "2023-08-22" },
    { site: "Melbourne Branch", status: "non-compliant", score: 65, lastAudit: "2023-07-30" },
    { site: "Perth Office", status: "compliant", score: 95, lastAudit: "2023-09-10" },
    { site: "Adelaide Center", status: "warning", score: 78, lastAudit: "2023-08-05" }
  ];

  // New contractor performance data
  const contractorPerformance = [
    { name: "ABC Electric", reliability: 4.8, onTimeCompletion: 95, qualityScore: 4.7, certStatus: "valid" },
    { name: "XYZ Plumbing", reliability: 4.2, onTimeCompletion: 88, qualityScore: 4.5, certStatus: "expiring" },
    { name: "123 Security", reliability: 4.9, onTimeCompletion: 98, qualityScore: 4.8, certStatus: "valid" },
    { name: "Fast Repairs", reliability: 3.7, onTimeCompletion: 75, qualityScore: 3.9, certStatus: "expired" }
  ];

  return (
    <div className="w-full">
      <AdminHeader 
        handleLogout={handleLogout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        notifications={notifications}
      />
      
      <div className="flex">
        <AdminSidebar 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          switchRole={switchRole}
        />
        
        <div className="flex-1">
          <TabContent 
            activeTab={activeTab}
            revenueData={revenueData}
            systemAlerts={systemAlerts}
            subscriptionData={subscriptionData}
            recentActivities={recentActivities}
            complianceData={complianceData}
            contractorPerformance={contractorPerformance}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
