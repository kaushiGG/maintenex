
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';

const monthlyMaintenanceByYear: Record<string, Array<{name: string, value: number}>> = {
  '2023': [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 50 },
    { name: 'Mar', value: 75 },
    { name: 'Apr', value: 45 },
    { name: 'May', value: 60 },
    { name: 'Jun', value: 80 },
    { name: 'Jul', value: 55 },
    { name: 'Aug', value: 70 },
    { name: 'Sep', value: 85 },
    { name: 'Oct', value: 72 },
    { name: 'Nov', value: 60 },
    { name: 'Dec', value: 45 },
  ],
};

const MaintenanceChart = () => {
  const maintenanceData = monthlyMaintenanceByYear['2023'];

  return (
    <Card className="w-full bg-white shadow-sm overflow-hidden">
      <div className="p-3 flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-2">
          <h3 className="text-sm font-semibold text-pretance-purple">Maintenance Activity</h3>
        </div>
        <div style={{ height: '180px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={maintenanceData}
              margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6b7280', fontSize: 9 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                }}
                cursor={{ fill: 'rgba(120, 81, 202, 0.1)' }}
              />
              <Bar 
                dataKey="value" 
                fill="#7851CA"
                radius={[4, 4, 0, 0]}
                barSize={14}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};

export default MaintenanceChart;
