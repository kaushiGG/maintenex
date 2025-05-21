import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Calendar, 
  CheckCircle2, 
  XCircle,
  Shield,
  Flame,
  Wrench,
  HardHat,
  AlertOctagon
} from 'lucide-react';

interface SafetyChecksDashboardProps {
  siteId: string;
}

const SafetyChecksDashboard: React.FC<SafetyChecksDashboardProps> = ({ siteId }) => {
  // This would typically come from an API
  const safetyStats = {
    complianceStatus: 'Compliant',
    lastAuditDate: '2023-11-15',
    nextAuditDate: '2024-05-15',
    openIssues: 2,
    resolvedIssues: 12,
    upcomingChecks: 3
  };

  // Mock safety check categories
  const safetyCategories = [
    { id: 1, name: 'Fire Safety', icon: Flame, dueDate: '2024-04-10', status: 'Compliant' },
    { id: 2, name: 'Equipment Safety', icon: Wrench, dueDate: '2024-05-25', status: 'Compliant' },
    { id: 3, name: 'Personal Protection', icon: HardHat, dueDate: '2024-03-30', status: 'Attention Needed' },
    { id: 4, name: 'Hazard Assessment', icon: AlertOctagon, dueDate: '2024-05-05', status: 'Compliant' }
  ];

  // Mock recent activity
  const recentActivity = [
    { id: 1, type: 'Issue Resolved', description: 'Fixed emergency exit blockage', date: '2024-02-05' },
    { id: 2, type: 'Check Completed', description: 'Monthly fire extinguisher check', date: '2024-02-01' },
    { id: 3, type: 'Issue Reported', description: 'Damaged electrical outlet in Room 101', date: '2024-01-28', status: 'Open' },
    { id: 4, type: 'Issue Reported', description: 'Trip hazard in hallway', date: '2024-01-25', status: 'Open' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Compliance Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-500" />
              Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {safetyStats.complianceStatus === 'Compliant' ? (
                  <CheckCircle2 className="h-10 w-10 text-green-500" />
                ) : (
                  <XCircle className="h-10 w-10 text-red-500" />
                )}
                <div>
                  <h3 className="text-lg font-bold">{safetyStats.complianceStatus}</h3>
                  <p className="text-sm text-gray-500">Last Audit: {safetyStats.lastAuditDate}</p>
                </div>
              </div>
              <Badge variant={safetyStats.complianceStatus === 'Compliant' ? 'outline' : 'destructive'}>
                {safetyStats.complianceStatus === 'Compliant' ? 'Up to date' : 'Action required'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Issues Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Issues Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div className="text-center">
                <p className="text-sm text-gray-500">Open Issues</p>
                <h3 className="text-2xl font-bold text-yellow-500">{safetyStats.openIssues}</h3>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Resolved</p>
                <h3 className="text-2xl font-bold text-green-500">{safetyStats.resolvedIssues}</h3>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Upcoming Checks</p>
                <h3 className="text-2xl font-bold text-blue-500">{safetyStats.upcomingChecks}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Scheduled Audit Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              Next Scheduled Audit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">{safetyStats.nextAuditDate}</h3>
                <p className="text-sm text-gray-500">
                  {new Date(safetyStats.nextAuditDate) > new Date() 
                    ? `In ${Math.ceil((new Date(safetyStats.nextAuditDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                    : 'Overdue'}
                </p>
              </div>
              <Button size="sm">Schedule Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Safety Check Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Safety Check Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyCategories.map(category => (
              <Card key={category.id} className={category.status !== 'Compliant' ? 'border-yellow-300 bg-yellow-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        {React.createElement(category.icon, { className: 'h-5 w-5 text-blue-600' })}
                      </div>
                      <div>
                        <h4 className="font-medium">{category.name}</h4>
                        <p className="text-sm text-gray-500">Due: {category.dueDate}</p>
                      </div>
                    </div>
                    <Badge variant={category.status === 'Compliant' ? 'outline' : 'secondary'} 
                      className={category.status !== 'Compliant' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}>
                      {category.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivity.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                <div className={`mt-0.5 ${activity.type === 'Issue Reported' && activity.status === 'Open' ? 'text-yellow-500' : 'text-green-500'}`}>
                  {activity.type === 'Issue Resolved' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : activity.type === 'Check Completed' ? (
                    <ClipboardCheck className="h-5 w-5" />
                  ) : (
                    <AlertTriangle className="h-5 w-5" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{activity.type}</h4>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                  <p className="text-sm">{activity.description}</p>
                  {activity.status && (
                    <Badge variant="outline" className="mt-1">
                      {activity.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button className="gap-2">
          <ClipboardCheck className="h-4 w-4" />
          Start New Safety Check
        </Button>
      </div>
    </div>
  );
};

export default SafetyChecksDashboard; 