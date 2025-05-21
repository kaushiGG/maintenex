
import React from 'react';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface SubscriptionDistributionProps {
  subscriptionData: Array<{ name: string; value: number; color: string }>;
}

const SubscriptionDistribution: React.FC<SubscriptionDistributionProps> = ({ subscriptionData }) => {
  return (
    <Card className="p-4 col-span-2">
      <h3 className="text-pretance-purple text-lg font-medium mb-4">Subscription Distribution</h3>
      <div className="flex">
        <div className="w-1/3">
          {subscriptionData.map((entry, index) => (
            <div key={index} className="flex items-center mb-2">
              <div 
                className="w-4 h-4 mr-2 rounded-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-pretance-purple">
                {entry.name} ({entry.value}%)
              </span>
            </div>
          ))}
        </div>
        <div className="w-2/3 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={subscriptionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                label={false}
              >
                {subscriptionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Percentage']}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default SubscriptionDistribution;
