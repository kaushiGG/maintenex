
import React from 'react';
import DashboardStats from './DashboardStats';
import RevenueChart from './RevenueChart';
import SystemAlerts from './SystemAlerts';
import SubscriptionDistribution from './SubscriptionDistribution';
import RecentActivity from './RecentActivity';
import ComplianceStatusOverview from '../compliance/ComplianceStatusOverview';
import ContractorPerformanceMetrics from '../contractors/ContractorPerformanceMetrics';

interface DashboardContentProps {
  revenueData: Array<{ name: string; value: number }>;
  systemAlerts: Array<{ message: string; level: string }>;
  subscriptionData: Array<{ name: string; value: number; color: string }>;
  recentActivities: Array<{ message: string; time: string; type: string }>;
  complianceData?: Array<{ site: string; status: string; score: number; lastAudit: string }>;
  contractorPerformance?: Array<{ name: string; reliability: number; onTimeCompletion: number; qualityScore: number; certStatus: string }>;
}

const DashboardContent: React.FC<DashboardContentProps> = ({
  revenueData,
  systemAlerts,
  subscriptionData,
  recentActivities,
  complianceData = [],
  contractorPerformance = []
}) => {
  return (
    <div className="p-6 bg-[#F3F0FF]">
      <div className="bg-gradient-to-r from-pretance-purple to-pretance-purple/80 rounded-lg p-6 mb-6 text-white">
        <h2 className="text-2xl font-bold">Welcome back, Admin</h2>
        <p className="opacity-90">Here's what's happening with your application today.</p>
      </div>

      <DashboardStats />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <RevenueChart revenueData={revenueData} />
        <SystemAlerts systemAlerts={systemAlerts} />
      </div>

      {/* New Compliance Status Overview */}
      {complianceData.length > 0 && (
        <div className="mb-6">
          <ComplianceStatusOverview complianceData={complianceData} />
        </div>
      )}

      {/* New Contractor Performance Metrics */}
      {contractorPerformance.length > 0 && (
        <div className="mb-6">
          <ContractorPerformanceMetrics contractorPerformance={contractorPerformance} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SubscriptionDistribution subscriptionData={subscriptionData} />
        <RecentActivity recentActivities={recentActivities} />
      </div>
    </div>
  );
};

export default DashboardContent;
