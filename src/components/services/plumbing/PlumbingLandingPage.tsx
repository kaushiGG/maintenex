import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Wrench, FileText, CheckCircle, Clock, CircleAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SitesMap from '../../sites/SitesMap';
import { mockSites } from '../../sites/mockSiteData';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
const PlumbingLandingPage = () => {
  const navigate = useNavigate();
  const handleSiteSelect = (siteId: string) => {
    const site = mockSites[siteId];
    if (!site) return;
    navigate(`/services/plumbing?siteId=${siteId}&siteName=${encodeURIComponent(site.name)}&siteAddress=${encodeURIComponent(site.address)}`);
  };
  return <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')} className="gap-1 text-forgemate-dark">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold flex items-center text-violet-900">
            <Wrench className="h-6 w-6 mr-2 text-blue-600" />
            Plumbing Services Locations
          </h1>
        </div>
      </div>
      
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium">Select a Site</h3>
              <p className="text-gray-600">Choose a site from the map below to access Plumbing services</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <SitesMap sites={Object.values(mockSites)} onSiteSelect={handleSiteSelect} />
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
          
          <Alert>
            <AlertDescription>
              <div className="mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                  Plumbing Services
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                Click on a site marker to access Plumbing services for that location.
              </p>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>;
};
export default PlumbingLandingPage;