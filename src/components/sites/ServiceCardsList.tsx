
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { serviceTypes } from './mockSiteData';
import * as LucideIcons from 'lucide-react';

interface ServiceCardsListProps {
  siteId: string;
  siteName: string;
}

export const ServiceCardsList = ({ siteId, siteName }: ServiceCardsListProps) => {
  const navigate = useNavigate();

  const handleViewTestingService = (type: string) => {
    // Map service types to standardized URL-safe route segments
    const serviceRouteMap: Record<string, string> = {
      'test-a-tag': 'test-a-tag',
      'rcd': 'rcd-testing',
      'emergency-exit': 'emergency-exit-lighting',
      'air-conditioning': 'air-conditioning',
      'thermal-imaging': 'thermal-imaging',
      'plumbing': 'plumbing'
    };
    
    const routeSegment = serviceRouteMap[type] || type;
    
    // Use the encoded siteName for all navigation
    navigate(`/services/${routeSegment}?siteId=${siteId}&siteName=${encodeURIComponent(siteName)}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(serviceTypes).map(([key, service]) => {
        // Dynamic import of Lucide icons
        const IconComponent = (LucideIcons as any)[service.icon];
        return (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <div className={`p-2 rounded-md mr-2 ${service.color}`}>
                  {IconComponent && <IconComponent className="h-5 w-5" />}
                </div>
                {service.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-500">
                Manage and track {service.name.toLowerCase()} for this site.
              </p>
            </CardContent>
            <CardFooter>
              {['test-a-tag', 'rcd', 'emergency-exit', 'air-conditioning', 'thermal-imaging', 'plumbing'].includes(key) ? (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => handleViewTestingService(key)}
                >
                  View {service.name}
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate(`/sites/${siteId}/${key}`)}
                >
                  View {service.name}
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};
