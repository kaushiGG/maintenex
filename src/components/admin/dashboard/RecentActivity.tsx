
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface RecentActivityProps {
  recentActivities: Array<{ message: string; time: string; type: string }>;
}

const RecentActivity: React.FC<RecentActivityProps> = ({ recentActivities }) => {
  return (
    <Card className="p-4 col-span-1">
      <h3 className="text-pretance-purple text-lg font-medium mb-4">Recent System Activity</h3>
      <div className="space-y-2">
        {recentActivities.map((activity, index) => (
          <div 
            key={index} 
            className={`p-3 rounded-md text-sm ${
              activity.type === 'success' 
                ? 'bg-green-100 border-l-4 border-green-500' 
                : 'bg-blue-100 border-l-4 border-blue-500'
            }`}
          >
            <div className="flex justify-between">
              <span>{activity.message}</span>
              <span className="text-xs text-gray-500">({activity.time})</span>
            </div>
          </div>
        ))}
        <Button 
          variant="outline" 
          className="w-full mt-2 text-pretance-purple border-pretance-purple/30 hover:bg-pretance-purple/10"
          onClick={() => toast.info("Viewing all activity logs")}
        >
          View All Activity
        </Button>
      </div>
    </Card>
  );
};

export default RecentActivity;
