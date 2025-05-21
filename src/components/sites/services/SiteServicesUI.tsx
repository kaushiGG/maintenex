
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Tag, 
  Zap, 
  Lightbulb, 
  Thermometer, 
  Droplet, 
  Wind, 
  ArrowLeft,
  Building
} from 'lucide-react';

const services = [
  {
    id: 'test-a-tag',
    name: 'Test & Tag',
    icon: Tag,
    description: 'Electrical appliance testing and tagging services.',
    path: '/services/test-a-tag',
    color: 'bg-orange-100 text-orange-600'
  },
  {
    id: 'rcd-testing',
    name: 'RCD Testing',
    icon: Zap,
    description: 'Residual current device testing and compliance services.',
    path: '/services/rcd-testing',
    color: 'bg-yellow-100 text-yellow-600'
  },
  {
    id: 'emergency-exit-lighting',
    name: 'Emergency & Exit Lighting',
    icon: Lightbulb,
    description: 'Emergency lighting testing and maintenance services.',
    path: '/services/emergency-exit-lighting',
    color: 'bg-green-100 text-green-600'
  },
  {
    id: 'thermal-imaging',
    name: 'Thermal Imaging',
    icon: Thermometer,
    description: 'Thermal imaging inspections and analysis services.',
    path: '/services/thermal-imaging',
    color: 'bg-red-100 text-red-600'
  },
  {
    id: 'plumbing',
    name: 'Plumbing',
    icon: Droplet,
    description: 'Plumbing maintenance and compliance services.',
    path: '/services/plumbing',
    color: 'bg-blue-100 text-blue-600'
  },
  {
    id: 'air-conditioning',
    name: 'Air Conditioning',
    icon: Wind,
    description: 'Air conditioning maintenance and servicing.',
    path: '/services/air-conditioning',
    color: 'bg-cyan-100 text-cyan-600'
  }
];

const SiteServicesUI = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('services');
  
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="text-purple-700 hover:bg-purple-100 hover:text-purple-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="flex items-center mb-6">
        <Building className="h-6 w-6 text-purple-700 mr-2" />
        <h1 className="text-2xl font-bold">Site Services</h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100">
          <TabsTrigger value="services" className="data-[state=active]:bg-white">
            Available Services
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-white">
            Service History
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-white">
            Service Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(service => (
              <Card key={service.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center text-lg">
                    <div className={`p-2 rounded-md mr-2 ${service.color}`}>
                      <service.icon className="h-5 w-5" />
                    </div>
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                  <Button 
                    onClick={() => navigate(service.path)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Access Service
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">View the history of all services performed across your sites.</p>
              <div className="p-10 text-center text-gray-400">
                <p>Service history data will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Service Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Access and download service reports for all your sites.</p>
              <div className="p-10 text-center text-gray-400">
                <p>Service reports will be displayed here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteServicesUI;
