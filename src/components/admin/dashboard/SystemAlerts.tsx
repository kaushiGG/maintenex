
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface SystemAlertsProps {
  systemAlerts: Array<{ message: string; level: string }>;
}

const SystemAlerts: React.FC<SystemAlertsProps> = ({ systemAlerts }) => {
  return (
    <Card className="p-4 col-span-1">
      <h3 className="text-pretance-purple text-lg font-medium mb-4">System Alerts</h3>
      <div className="space-y-2">
        {systemAlerts.map((alert, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-md text-sm flex items-start ${
              alert.level === 'critical' 
                ? 'bg-red-100 border-l-4 border-red-500' 
                : 'bg-amber-100 border-l-4 border-amber-500'
            }`}
          >
            <AlertTriangle className={`h-4 w-4 mr-2 mt-0.5 ${
              alert.level === 'critical' ? 'text-red-500' : 'text-amber-500'
            }`} />
            <span>{alert.message}</span>
          </div>
        ))}
        <Button 
          variant="outline" 
          className="w-full mt-2 text-pretance-purple border-pretance-purple/30 hover:bg-pretance-purple/10"
          onClick={() => toast.info("Viewing all system alerts")}
        >
          View All Alerts
        </Button>
      </div>
    </Card>
  );
};

export default SystemAlerts;
