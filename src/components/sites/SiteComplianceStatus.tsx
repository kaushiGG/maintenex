
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertTriangle, XCircle, Calendar } from 'lucide-react';
import { mockSites } from './mockSiteData';

type ComplianceCategory = {
  name: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  percentage: number;
  items: {
    name: string;
    status: 'compliant' | 'warning' | 'non-compliant';
    dueDate: Date | null;
    lastChecked: Date;
  }[];
};

type SiteCompliance = {
  siteId: string;
  overallScore: number;
  categories: {
    fire: ComplianceCategory;
    electrical: ComplianceCategory;
    health: ComplianceCategory;
    building: ComplianceCategory;
    environmental: ComplianceCategory;
  };
};

// Mock compliance data
const mockComplianceData: Record<string, SiteCompliance> = {
  '1': {
    siteId: '1',
    overallScore: 87,
    categories: {
      fire: {
        name: 'Fire Safety',
        status: 'compliant',
        percentage: 95,
        items: [
          { name: 'Fire Extinguishers', status: 'compliant', dueDate: new Date('2024-08-15'), lastChecked: new Date('2023-08-15') },
          { name: 'Smoke Detectors', status: 'compliant', dueDate: new Date('2024-06-20'), lastChecked: new Date('2023-12-20') },
          { name: 'Emergency Exits', status: 'compliant', dueDate: new Date('2024-07-10'), lastChecked: new Date('2023-07-10') },
          { name: 'Fire Alarm System', status: 'warning', dueDate: new Date('2024-02-28'), lastChecked: new Date('2023-02-28') }
        ]
      },
      electrical: {
        name: 'Electrical',
        status: 'warning',
        percentage: 82,
        items: [
          { name: 'Circuit Breakers', status: 'compliant', dueDate: new Date('2024-05-15'), lastChecked: new Date('2023-05-15') },
          { name: 'RCD Testing', status: 'warning', dueDate: new Date('2024-02-10'), lastChecked: new Date('2023-02-10') },
          { name: 'Emergency Lighting', status: 'compliant', dueDate: new Date('2024-04-20'), lastChecked: new Date('2023-04-20') },
          { name: 'Power Points', status: 'warning', dueDate: new Date('2024-03-05'), lastChecked: new Date('2023-03-05') }
        ]
      },
      health: {
        name: 'Health & Safety',
        status: 'compliant',
        percentage: 90,
        items: [
          { name: 'First Aid Kits', status: 'compliant', dueDate: new Date('2024-09-15'), lastChecked: new Date('2023-09-15') },
          { name: 'Workplace Safety', status: 'compliant', dueDate: new Date('2024-08-10'), lastChecked: new Date('2023-08-10') },
          { name: 'Eyewash Stations', status: 'compliant', dueDate: new Date('2024-07-20'), lastChecked: new Date('2023-07-20') }
        ]
      },
      building: {
        name: 'Building',
        status: 'compliant',
        percentage: 88,
        items: [
          { name: 'Structural Inspection', status: 'compliant', dueDate: new Date('2024-11-15'), lastChecked: new Date('2023-11-15') },
          { name: 'HVAC Maintenance', status: 'warning', dueDate: new Date('2024-02-20'), lastChecked: new Date('2023-02-20') },
          { name: 'Roof Inspection', status: 'compliant', dueDate: new Date('2024-10-15'), lastChecked: new Date('2023-10-15') }
        ]
      },
      environmental: {
        name: 'Environmental',
        status: 'warning',
        percentage: 75,
        items: [
          { name: 'Waste Management', status: 'warning', dueDate: new Date('2024-03-15'), lastChecked: new Date('2023-03-15') },
          { name: 'Water Quality', status: 'compliant', dueDate: new Date('2024-06-10'), lastChecked: new Date('2023-06-10') },
          { name: 'Air Quality', status: 'non-compliant', dueDate: new Date('2024-01-20'), lastChecked: new Date('2023-01-20') }
        ]
      }
    }
  },
  '2': {
    siteId: '2',
    overallScore: 72,
    categories: {
      fire: {
        name: 'Fire Safety',
        status: 'warning',
        percentage: 78,
        items: [
          { name: 'Fire Extinguishers', status: 'warning', dueDate: new Date('2024-03-10'), lastChecked: new Date('2023-03-10') },
          { name: 'Smoke Detectors', status: 'compliant', dueDate: new Date('2024-05-20'), lastChecked: new Date('2023-05-20') },
          { name: 'Emergency Exits', status: 'warning', dueDate: new Date('2024-02-15'), lastChecked: new Date('2023-02-15') },
          { name: 'Fire Alarm System', status: 'compliant', dueDate: new Date('2024-07-05'), lastChecked: new Date('2023-07-05') }
        ]
      },
      electrical: {
        name: 'Electrical',
        status: 'non-compliant',
        percentage: 65,
        items: [
          { name: 'Circuit Breakers', status: 'warning', dueDate: new Date('2024-02-25'), lastChecked: new Date('2023-02-25') },
          { name: 'RCD Testing', status: 'non-compliant', dueDate: new Date('2024-01-05'), lastChecked: new Date('2023-01-05') },
          { name: 'Emergency Lighting', status: 'warning', dueDate: new Date('2024-03-15'), lastChecked: new Date('2023-03-15') },
          { name: 'Power Points', status: 'compliant', dueDate: new Date('2024-06-10'), lastChecked: new Date('2023-06-10') }
        ]
      },
      health: {
        name: 'Health & Safety',
        status: 'warning',
        percentage: 80,
        items: [
          { name: 'First Aid Kits', status: 'warning', dueDate: new Date('2024-02-15'), lastChecked: new Date('2023-02-15') },
          { name: 'Workplace Safety', status: 'compliant', dueDate: new Date('2024-05-10'), lastChecked: new Date('2023-05-10') },
          { name: 'Eyewash Stations', status: 'warning', dueDate: new Date('2024-03-20'), lastChecked: new Date('2023-03-20') }
        ]
      },
      building: {
        name: 'Building',
        status: 'compliant',
        percentage: 85,
        items: [
          { name: 'Structural Inspection', status: 'compliant', dueDate: new Date('2024-09-15'), lastChecked: new Date('2023-09-15') },
          { name: 'HVAC Maintenance', status: 'compliant', dueDate: new Date('2024-08-20'), lastChecked: new Date('2023-08-20') },
          { name: 'Roof Inspection', status: 'warning', dueDate: new Date('2024-04-15'), lastChecked: new Date('2023-04-15') }
        ]
      },
      environmental: {
        name: 'Environmental',
        status: 'non-compliant',
        percentage: 60,
        items: [
          { name: 'Waste Management', status: 'non-compliant', dueDate: new Date('2024-01-15'), lastChecked: new Date('2023-01-15') },
          { name: 'Water Quality', status: 'warning', dueDate: new Date('2024-02-10'), lastChecked: new Date('2023-02-10') },
          { name: 'Air Quality', status: 'warning', dueDate: new Date('2024-03-20'), lastChecked: new Date('2023-03-20') }
        ]
      }
    }
  }
};

const SiteComplianceStatus = () => {
  const [selectedSite, setSelectedSite] = useState('1');
  const [activeTab, setActiveTab] = useState('overview');
  
  // Get the sites as an array
  const sitesArray = Object.values(mockSites);
  const currentSite = sitesArray.find(site => site.id === selectedSite);
  const complianceData = mockComplianceData[selectedSite];
  
  if (!complianceData) {
    return <div>No compliance data available for this site.</div>;
  }
  
  const getStatusColor = (status: 'compliant' | 'warning' | 'non-compliant') => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: 'compliant' | 'warning' | 'non-compliant') => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };
  
  const renderOverview = () => {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold">Overall Compliance Score</h3>
              <p className="text-gray-500">Based on all compliance categories</p>
            </div>
            <div className="text-3xl font-bold">
              {complianceData.overallScore}%
            </div>
          </div>
          <Progress value={complianceData.overallScore} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-gray-500">
            <span>Critical</span>
            <span>Excellent</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.values(complianceData.categories).map((category) => (
            <Card key={category.name} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{category.name}</h3>
                  <Badge className={getStatusColor(category.status)}>
                    {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
                  </Badge>
                </div>
                <Progress value={category.percentage} className="h-2 mb-2" />
                <div className="text-sm text-gray-500">{category.percentage}% compliant</div>
                <div className="mt-3 space-y-1">
                  {category.items
                    .filter(item => item.status !== 'compliant')
                    .slice(0, 2)
                    .map((item, idx) => (
                      <div key={idx} className="flex items-center text-xs">
                        {getStatusIcon(item.status)}
                        <span className="ml-1 truncate">{item.name}</span>
                        {item.dueDate && (
                          <span className="ml-auto flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {item.dueDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };
  
  const renderCategory = (category: ComplianceCategory) => {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold">{category.name}</h3>
            <p className="text-gray-500">{category.percentage}% compliant</p>
          </div>
          <Badge className={`px-3 py-1 ${getStatusColor(category.status)}`}>
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </Badge>
        </div>
        
        <Progress value={category.percentage} className="h-2" />
        
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="grid grid-cols-1 divide-y">
            {category.items.map((item, idx) => (
              <div key={idx} className="p-3 hover:bg-gray-50">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    {getStatusIcon(item.status)}
                    <span className="ml-2 font-medium">{item.name}</span>
                  </div>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Badge>
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span>Last checked: {item.lastChecked.toLocaleDateString()}</span>
                  </div>
                  {item.dueDate && (
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>Due: {item.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
        <div className="flex-1 md:max-w-xs">
          <Select value={selectedSite} onValueChange={setSelectedSite}>
            <SelectTrigger>
              <SelectValue placeholder="Select a site" />
            </SelectTrigger>
            <SelectContent>
              {sitesArray.map((site) => (
                <SelectItem key={site.id} value={site.id}>
                  {site.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="text-right">
          <h2 className="text-xl font-semibold">{currentSite?.name || 'Site'} - Compliance Status</h2>
          <p className="text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="fire">Fire Safety</TabsTrigger>
          <TabsTrigger value="electrical">Electrical</TabsTrigger>
          <TabsTrigger value="health">Health & Safety</TabsTrigger>
          <TabsTrigger value="building">Building</TabsTrigger>
          <TabsTrigger value="environmental">Environmental</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="fire">
          {renderCategory(complianceData.categories.fire)}
        </TabsContent>
        
        <TabsContent value="electrical">
          {renderCategory(complianceData.categories.electrical)}
        </TabsContent>
        
        <TabsContent value="health">
          {renderCategory(complianceData.categories.health)}
        </TabsContent>
        
        <TabsContent value="building">
          {renderCategory(complianceData.categories.building)}
        </TabsContent>
        
        <TabsContent value="environmental">
          {renderCategory(complianceData.categories.environmental)}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteComplianceStatus;
