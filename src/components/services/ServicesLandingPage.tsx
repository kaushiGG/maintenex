import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, FileText, Zap, CircleCheck, Clock, CircleAlert, Thermometer, Droplet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SitesMap from '../sites/SitesMap';
import { mockSites } from '../sites/mockSiteData';
import { Site } from '@/types/site';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const serviceIcons = {
  'test-a-tag': Package,
  'rcd-testing': Zap,
  'emergency-exit-lighting': FileText,
  'thermal-imaging': Thermometer,
  'plumbing': Droplet,
  'air-conditioning': Thermometer,
  'safety-checks': CircleCheck
};

const serviceNames = {
  'test-a-tag': 'Test & Tag',
  'rcd-testing': 'RCD Testing',
  'emergency-exit-lighting': 'Emergency Exit Lighting',
  'thermal-imaging': 'Thermal Imaging',
  'plumbing': 'Plumbing',
  'air-conditioning': 'Air Conditioning',
  'safety-checks': 'Safety Checks'
};

const ServicesLandingPage = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  const navigate = useNavigate();
  const serviceName = serviceType && serviceNames[serviceType as keyof typeof serviceNames];
  const ServiceIcon = serviceType && serviceIcons[serviceType as keyof typeof serviceIcons] || Package;
  
  const handleSiteSelect = (siteId: string) => {
    if (!serviceType) return;
    
    const site = mockSites[siteId];
    if (!site) return;
    
    // Use consistent URL format with proper encoding
    navigate(`/services/${serviceType}?siteId=${siteId}&siteName=${encodeURIComponent(site.name)}&siteAddress=${encodeURIComponent(site.address)}`);
  };
  
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold flex items-center">
            <ServiceIcon className="h-6 w-6 mr-2 text-purple-600" />
            {serviceName} Locations
          </h1>
        </div>
      </div>
      
      <Card className="mb-6 bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Select a Site</h3>
              <p className="text-gray-600">Choose a site from the map below to access {serviceName} services</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SitesMap 
            sites={Object.values(mockSites)}
            onSiteSelect={handleSiteSelect}
          />
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-3">Status Legend</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span>Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                  <span>Due Soon</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500"></div>
                  <span>Overdue</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {serviceType && (
            <Alert>
              <AlertDescription>
                <div className="mb-2">
                  <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
                    {serviceName}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">
                  Click on a site marker to access {serviceName} services for that location.
                </p>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesLandingPage;
