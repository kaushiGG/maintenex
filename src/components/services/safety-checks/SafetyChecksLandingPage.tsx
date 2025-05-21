import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Building, CircleCheck, Calendar, ClipboardCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const SafetyChecksLandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const siteId = queryParams.get('siteId') || '';
  const siteName = queryParams.get('siteName') || 'Unknown Site';
  const siteAddress = queryParams.get('siteAddress') || 'Unknown Address';

  const handleStartService = () => {
    navigate(`/services/safety-checks?siteId=${siteId}&siteName=${encodeURIComponent(siteName)}&siteAddress=${encodeURIComponent(siteAddress)}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1 mr-4"
          onClick={() => navigate('/services/landing/safety-checks')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sites
        </Button>
        <h1 className="text-2xl font-bold">Safety Checks Services</h1>
      </div>

      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Building className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium">{siteName}</h3>
              <p className="text-gray-600">{siteAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CircleCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">85% Compliant</p>
                  <p className="text-sm text-gray-500">Last audit: 2 months ago</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Next Scheduled Audit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">June 15, 2023</p>
                <p className="text-sm text-gray-500">In 3 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Safety Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-8 w-8 text-amber-500" />
              <div>
                <p className="font-medium">2 Open Reports</p>
                <p className="text-sm text-gray-500">5 total in last 12 months</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Safety Check Services</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span>Safety Audits and Inspections</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span>Compliance Documentation</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span>Incident Report Management</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span>Hazard Identification</span>
              </li>
              <li className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-500" />
                <span>Safety Equipment Checks</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">Completed</Badge>
                  <span className="text-sm text-gray-500">May 3, 2023</span>
                </div>
                <p>Quarterly Safety Audit</p>
              </li>
              <li>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">In Progress</Badge>
                  <span className="text-sm text-gray-500">April 15, 2023</span>
                </div>
                <p>Fire Equipment Inspection</p>
              </li>
              <li>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">Incident</Badge>
                  <span className="text-sm text-gray-500">March 27, 2023</span>
                </div>
                <p>Minor Slip and Fall Incident Reported</p>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          size="lg" 
          className="gap-2"
          onClick={handleStartService}
        >
          <CircleCheck className="h-5 w-5" />
          Start Safety Checks Management
        </Button>
      </div>
    </div>
  );
};

export default SafetyChecksLandingPage; 