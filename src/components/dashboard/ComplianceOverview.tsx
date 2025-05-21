
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const complianceCategories = [
  { 
    category: 'Safety Inspections', 
    compliance: 96, 
    items: [
      { name: 'Fire System Annual Check', status: 'Completed', date: 'Apr 15, 2023' },
      { name: 'Elevator Maintenance', status: 'Completed', date: 'May 02, 2023' },
      { name: 'Emergency Exit Inspection', status: 'Upcoming', date: 'Jul 10, 2023' }
    ] 
  },
  { 
    category: 'Certifications', 
    compliance: 87, 
    items: [
      { name: 'Building Operation License', status: 'Active', date: 'Expires Dec 2023' },
      { name: 'Environmental Compliance', status: 'Active', date: 'Expires Aug 2023' },
      { name: 'Safety Certificate Renewal', status: 'Attention', date: 'Due in 30 days' }
    ] 
  },
  { 
    category: 'Regulatory', 
    compliance: 92, 
    items: [
      { name: 'ADA Compliance Review', status: 'Completed', date: 'Jan 20, 2023' },
      { name: 'OSHA Requirements Check', status: 'Completed', date: 'Feb 18, 2023' },
      { name: 'Hazardous Materials Report', status: 'Pending', date: 'Due Jun 30, 2023' }
    ] 
  }
];

const ComplianceOverview = () => {
  return (
    <Card className="shadow-sm hover:shadow transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-pretance-purple">Compliance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Safety Inspections">
          <TabsList className="w-full mb-4">
            {complianceCategories.map((category) => (
              <TabsTrigger 
                key={category.category} 
                value={category.category}
                className="flex-1"
              >
                {category.category}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {complianceCategories.map((category) => (
            <TabsContent key={category.category} value={category.category}>
              <div className="mb-4 flex items-center">
                <div className="relative h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute left-0 top-0 h-full bg-pretance-purple"
                    style={{ width: `${category.compliance}%` }}
                  ></div>
                </div>
                <span className="ml-4 font-semibold text-pretance-purple">{category.compliance}%</span>
              </div>
              
              <div className="space-y-3">
                {category.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <Badge 
                      className={
                        item.status === 'Completed' || item.status === 'Active'
                          ? 'bg-green-100 text-green-800 border-0'
                          : item.status === 'Upcoming' || item.status === 'Pending'
                            ? 'bg-blue-100 text-blue-800 border-0'
                            : 'bg-yellow-100 text-yellow-800 border-0'
                      }
                    >
                      {item.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ComplianceOverview;
