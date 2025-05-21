
import React from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RevenueChartProps {
  revenueData: Array<{ name: string; value: number }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ revenueData }) => {
  return (
    <Card className="p-4 col-span-2">
      <h3 className="text-pretance-purple text-lg font-medium mb-4">Monthly Revenue</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={revenueData}
            margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, 'Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.375rem',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#7851CA"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default RevenueChart;
