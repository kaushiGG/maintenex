import React from 'react';
import ClientManagement from '../ClientManagement';
import DashboardContent from './DashboardContent';
import ContentPlaceholder from './ContentPlaceholder';
import { ContractorsManagement } from '../../../components/contractors/ContractorsManagement';
import SitesModule from '../../client/dashboard/SitesModule';

interface TabContentProps {
  activeTab: 'dashboard' | 'clients' | 'packages' | 'reports' | 'settings' | 
             'contractors' | 'sites' | 'schedule' | 'documents' | 'notifications' | 'billing';
  revenueData: Array<{ name: string; value: number }>;
  systemAlerts: Array<{ message: string; level: string }>;
  subscriptionData: Array<{ name: string; value: number; color: string }>;
  recentActivities: Array<{ message: string; time: string; type: string }>;
  complianceData?: Array<{ site: string; status: string; score: number; lastAudit: string }>;
  contractorPerformance?: Array<{ name: string; reliability: number; onTimeCompletion: number; qualityScore: number; certStatus: string }>;
}

const TabContent: React.FC<TabContentProps> = ({
  activeTab,
  revenueData,
  systemAlerts,
  subscriptionData,
  recentActivities,
  complianceData = [],
  contractorPerformance = []
}) => {
  switch (activeTab) {
    case 'clients':
      return <ClientManagement />;
    case 'dashboard':
      return (
        <DashboardContent 
          revenueData={revenueData}
          systemAlerts={systemAlerts}
          subscriptionData={subscriptionData}
          recentActivities={recentActivities}
          complianceData={complianceData}
          contractorPerformance={contractorPerformance}
        />
      );
    case 'contractors':
      return <ContractorsManagement />;
    case 'sites':
      return <SitesModule initialSection="management" />;
    case 'schedule':
      return <ContentPlaceholder title="Schedule Calendar" />;
    case 'documents':
      return <ContentPlaceholder title="Document Control" />;
    case 'notifications':
      return <ContentPlaceholder title="Notification Center" />;
    case 'billing':
      return <ContentPlaceholder title="Billing Dashboard" />;
    case 'reports':
      return <ContentPlaceholder title="Compliance Reporting" />;
    case 'packages':
      return <ContentPlaceholder title="Package Management" />;
    case 'settings':
      return <ContentPlaceholder title="System Settings" />;
    default:
      return null;
  }
};

export default TabContent;
