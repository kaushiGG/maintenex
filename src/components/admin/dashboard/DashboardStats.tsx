
import React from 'react';
import { Card } from '@/components/ui/card';

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4 flex flex-col">
        <span className="text-pretance-purple mb-1 text-sm">Total Clients</span>
        <span className="text-3xl font-bold text-pretance-purple">246</span>
        <span className="text-green-500 text-xs mt-1">↑ 12% from last month</span>
      </Card>
      
      <Card className="p-4 flex flex-col">
        <span className="text-pretance-purple mb-1 text-sm">Active Subscriptions</span>
        <span className="text-3xl font-bold text-pretance-purple">228</span>
        <span className="text-green-500 text-xs mt-1">↑ 8% from last month</span>
      </Card>
      
      <Card className="p-4 flex flex-col">
        <span className="text-pretance-purple mb-1 text-sm">Monthly Revenue</span>
        <span className="text-3xl font-bold text-pretance-purple">$127,850</span>
        <span className="text-green-500 text-xs mt-1">↑ 15% from last month</span>
      </Card>

      <Card className="p-4 flex flex-col">
        <span className="text-pretance-purple mb-1 text-sm">Avg. Response Time</span>
        <span className="text-3xl font-bold text-pretance-purple">1.2h</span>
        <span className="text-red-500 text-xs mt-1">↑ 0.3h from last week</span>
      </Card>
    </div>
  );
};

export default DashboardStats;
