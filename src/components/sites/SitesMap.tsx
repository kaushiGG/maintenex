
import React, { useState } from 'react';
import { Site } from '@/types/site';
import { Building, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SitesMapProps {
  sites: Site[];
  onSiteSelect: (siteId: string) => void;
}

const SitesMap = ({ sites, onSiteSelect }: SitesMapProps) => {
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [hoveredSite, setHoveredSite] = useState<string | null>(null);
  
  // Simple map with site markers positioned based on coordinates
  const renderSimpleMap = () => {
    return (
      <div className="relative w-full h-[500px] bg-slate-100 rounded-lg border border-gray-200 overflow-hidden">
        {/* Map of Australia background - now using a road map for better visibility */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[95%] h-[95%] bg-contain bg-center bg-no-repeat" 
            style={{ 
              backgroundImage: "url('https://www.nationsonline.org/maps/Australia-Road-Map.jpg')",
              opacity: 0.75
            }}>
          </div>
        </div>
        
        {/* Site markers */}
        {sites.map(site => {
          if (!site.coordinates) return null;
          
          // Parse coordinates and map them to the container dimensions
          const [lat, lng] = site.coordinates.split(',').map(Number);
          
          // Map latitude (-10 to -43) and longitude (113 to 153) to our container space
          // This is a very simplified mapping just for visualization purposes
          const x = ((lng - 113) / (153 - 113)) * 100; // percentage position
          const y = ((lat - (-10)) / ((-43) - (-10))) * 100; // percentage position
          
          // Determine marker color based on compliance status
          let markerColor = 'bg-green-500';
          if (site.complianceStatus === 'warning') {
            markerColor = 'bg-yellow-500';
          } else if (site.complianceStatus === 'non-compliant') {
            markerColor = 'bg-red-500';
          }
          
          return (
            <div
              key={site.id}
              className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                hoveredSite === site.id || selectedSite?.id === site.id ? 'z-10 scale-125' : 'z-0'
              }`}
              style={{ left: `${x}%`, top: `${y}%` }}
              onClick={() => setSelectedSite(site)}
              onMouseEnter={() => setHoveredSite(site.id)}
              onMouseLeave={() => setHoveredSite(null)}
            >
              <div className={`w-4 h-4 ${markerColor} rounded-full shadow-md border-2 border-white flex items-center justify-center`}>
                {(hoveredSite === site.id || selectedSite?.id === site.id) && (
                  <div className="absolute bottom-full mb-1 whitespace-nowrap bg-white px-2 py-1 rounded text-xs shadow">
                    {site.name}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {renderSimpleMap()}
      
      {selectedSite && (
        <Card className="border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  <Building className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedSite.name}</h3>
                  <p className="text-gray-500 text-sm">{selectedSite.address}</p>
                </div>
              </div>
              <Button 
                onClick={() => onSiteSelect(selectedSite.id)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <MapPin className="mr-2 h-4 w-4" />
                View Services
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Fallback list view for sites */}
      <div className="mt-4">
        <h3 className="text-lg font-medium mb-4">Available Sites</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map(site => (
            <Card key={site.id} className="hover:border-purple-200 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <Building className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">{site.name}</h3>
                      <p className="text-gray-500 text-sm">{site.address}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => onSiteSelect(site.id)}
                    size="sm"
                    variant="outline"
                  >
                    Select
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitesMap;
