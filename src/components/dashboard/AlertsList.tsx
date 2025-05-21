
import React from 'react';
import { Card } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

type Alert = {
  message: string;
  type: 'warning' | 'danger';
  icon: typeof AlertTriangle;
};

const alerts: Alert[] = [
  { message: "Fire Alarm Certification Expiring", type: "warning", icon: AlertTriangle },
  { message: "RCD Testing Overdue - Site #103", type: "danger", icon: AlertTriangle },
];

const AlertsList = () => {
  return (
    <Card className="bg-white shadow-sm h-full">
      <div className="p-3 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-pretance-purple mb-2">Alerts</h3>
        <div className="space-y-1.5 overflow-y-auto">
          {alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-2 rounded-lg flex items-start ${
                alert.type === 'warning' 
                  ? 'bg-yellow-50 border-l-4 border-yellow-300' 
                  : 'bg-red-50 border-l-4 border-red-300'
              }`}
            >
              <alert.icon 
                className={`mr-1.5 h-3.5 w-3.5 flex-shrink-0 ${
                  alert.type === 'warning' ? 'text-yellow-500' : 'text-red-500'
                }`} 
              />
              <div>
                <p className={`text-xs ${
                  alert.type === 'warning' ? 'text-yellow-700' : 'text-red-700'
                }`}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default AlertsList;
