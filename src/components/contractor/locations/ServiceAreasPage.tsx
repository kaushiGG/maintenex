import React, { useState, useEffect } from 'react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  MapPin, 
  Search, 
  Layers, 
  ListFilter,
  CheckCircle
} from 'lucide-react';
import ServiceAreasMap from './ServiceAreasMap';
import { Badge } from '@/components/ui/badge';
import { fetchServiceAreas, ServiceArea } from '@/services/serviceAreas';
import { useToast } from '@/hooks/use-toast';

interface ServiceAreasPageProps {
  handleLogout: () => void;
  userRole: 'business' | 'contractor';
}

const ServiceAreasPage = ({ 
  handleLogout, 
  userRole 
}: ServiceAreasPageProps) => {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [serviceAreas, setServiceAreas] = useState<ServiceArea[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadServiceAreas();
  }, []);

  const loadServiceAreas = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceAreas();
      console.log('Loaded service areas:', data);
      setServiceAreas(data);
    } catch (error) {
      console.error('Failed to load service areas:', error);
      toast({
        title: "Error",
        description: "Failed to load service areas. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={null} 
        userRole={userRole} 
        handleLogout={handleLogout} 
        title="Service Areas"
        portalType="contractor"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="contractor"
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 bg-gray-50 overflow-x-hidden">
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold leading-7 text-black sm:text-2xl sm:tracking-tight">
                Contractor Service Areas
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                View and manage your assigned service areas and available jobs in these locations
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex space-x-3">
              <div className="flex items-center space-x-2">
                <Button 
                  variant={viewMode === 'map' ? 'default' : 'outline'} 
                  className={viewMode === 'map' ? 'bg-orange-500 hover:bg-orange-700' : 'border-orange-200 text-orange-600'}
                  onClick={() => setViewMode('map')}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Map View
                </Button>
                <Button 
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  className={viewMode === 'list' ? 'bg-orange-500 hover:bg-orange-700' : 'border-orange-200 text-orange-600'}
                  onClick={() => setViewMode('list')}
                >
                  <Layers className="h-4 w-4 mr-2" />
                  List View
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input 
                className="pl-10 pr-4 py-2 w-full" 
                placeholder="Search by postcodes, suburbs..."
              />
            </div>
            <Button variant="outline" className="text-orange-600 border-orange-200">
              <ListFilter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <Card className="border-orange-200 mb-6">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <div className="bg-orange-100 p-2 rounded-full">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-black">Assigned Service Areas</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    The map below shows all locations where you're currently registered to provide services. 
                    Click on a service area to see available jobs in that location.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                <p className="text-gray-500">Loading service areas...</p>
              </div>
            </div>
          ) : (
            <>
              {viewMode === 'map' ? (
                <div className="bg-white rounded-lg shadow-sm p-4 h-[600px] border border-orange-200">
                  <ServiceAreasMap serviceAreas={serviceAreas} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {serviceAreas.length === 0 ? (
                    <div className="col-span-full flex justify-center items-center h-64">
                      <div className="text-center">
                        <p className="text-gray-500 mb-4">No service areas found</p>
                      </div>
                    </div>
                  ) : (
                    serviceAreas.map(area => (
                      <Card key={area.id} className="overflow-hidden border-orange-200 hover:border-orange-400 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-lg text-black">{area.name}</h3>
                            <Badge className={area.status === 'active' ? 'bg-orange-500' : 'bg-amber-500'}>
                              {area.status === 'active' ? (
                                <span className="flex items-center">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Active
                                </span>
                              ) : 'Pending'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm text-gray-500">
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-orange-600" />
                              <span>{area.radius} km radius</span>
                            </div>
                            <div>
                              <span className="font-medium text-gray-700">Postcodes:</span> {area.postcodes}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-between">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-orange-600 border-orange-200"
                            >
                              View Details
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ServiceAreasPage;
