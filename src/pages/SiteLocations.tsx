import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import BusinessDashboard from '@/components/BusinessDashboard';
import SitesManagement from '@/components/sites/SitesManagement';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import SiteImportModal from '@/components/sites/SiteImportModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, List, Search, Filter, X, Building, CheckCircle, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceStatus } from '@/types/site';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MdRefresh } from 'react-icons/md';

// Define site type including geocoded coordinates
interface Site {
  id: string;
  name: string;
  address: string;
  site_type: string;
  contact_email: string;
  contact_phone: string;
  complianceStatus: ComplianceStatus;
  assignedContractors: string[];
  itemCount: number;
  coordinates?: string;
  notes?: string;
  geocoded?: boolean | [number, number];
}

// Define types for geocoded sites
type GeocodedSite = Site & { 
  geocoded: [number, number] 
};

// Fallback data for when Supabase connection fails
const FALLBACK_SITES: Site[] = [
  {
    id: '1',
    name: 'Sydney Central Office',
    address: '123 George St, Sydney NSW 2000, Australia',
    coordinates: '-33.865143,151.2099',
    complianceStatus: 'non-compliant',
    assignedContractors: [],
    itemCount: 15,
    site_type: 'Office Building',
    contact_email: 'sydney@example.com',
    contact_phone: '+61 2 1234 5678',
    geocoded: [-33.865143, 151.2099] as [number, number]
  },
  {
    id: '2',
    name: 'Sydney North Shore',
    address: '45 Walker St, North Sydney NSW 2060, Australia',
    coordinates: '-33.839097,151.207339',
    complianceStatus: 'non-compliant',
    assignedContractors: [],
    itemCount: 12,
    site_type: 'Commercial Property',
    contact_email: 'northshore@example.com',
    contact_phone: '+61 2 8765 4321',
    geocoded: [-33.839097, 151.207339] as [number, number]
  },
  {
    id: '3',
    name: 'Melbourne CBD',
    address: '200 Collins St, Melbourne VIC 3000, Australia',
    coordinates: '-37.816234,144.967270',
    complianceStatus: 'compliant',
    assignedContractors: [],
    itemCount: 25,
    site_type: 'Office Building',
    contact_email: 'melbourne@example.com',
    contact_phone: '+61 3 9876 5432',
    geocoded: [-37.816234, 144.967270] as [number, number]
  },
  {
    id: '4',
    name: 'Brisbane City Centre',
    address: '55 Adelaide St, Brisbane QLD 4000, Australia',
    coordinates: '-27.467778,153.028056',
    complianceStatus: 'warning',
    assignedContractors: [],
    itemCount: 18,
    site_type: 'Commercial Hub',
    contact_email: 'brisbane@example.com',
    contact_phone: '+61 7 5432 1098',
    geocoded: [-27.467778, 153.028056] as [number, number]
  },
  {
    id: '5',
    name: 'Perth Business District',
    address: '125 St Georges Terrace, Perth WA 6000, Australia',
    coordinates: '-31.953512,115.857048',
    complianceStatus: 'compliant',
    assignedContractors: [],
    itemCount: 14,
    site_type: 'Office Tower',
    contact_email: 'perth@example.com',
    contact_phone: '+61 8 6789 0123',
    geocoded: [-31.953512, 115.857048] as [number, number]
  }
];

// Fix for the default marker icon issue in react-leaflet
// This is needed because the CSS has the marker image in a different location than expected
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper functions for status colors
const getStatusColorClass = (status: ComplianceStatus): string => {
  switch(status) {
    case 'compliant':
      return 'text-green-600';
    case 'warning':
      return 'text-yellow-500';
    case 'non-compliant':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};

const getMarkerColor = (status: ComplianceStatus): string => {
  switch(status) {
    case 'compliant':
      return 'green';
    case 'warning':
      return 'orange';
    case 'non-compliant':
      return 'red';
    default:
      return 'blue';
  }
};

// Create custom marker icons based on compliance status
const createCustomIcon = (status: ComplianceStatus | string) => {
  // Determine color based on status
  let color;
  if (status === 'non-compliant') {
    color = '#ef4444'; // Red
  } else if (status === 'warning') {
    color = '#eab308'; // Yellow
  } else if (status === 'compliant') {
    color = '#22c55e'; // Green
  } else {
    color = '#3b82f6'; // Blue default
  }

  return L.divIcon({
    className: 'custom-marker-icon',
    html: `<div style="width: 28px; height: 28px; background-color: ${color}; border-radius: 50%; border: 2px solid white; box-shadow: 0 3px 6px rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center;">
            <div style="width: 18px; height: 18px; background-color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
              <div style="width: 12px; height: 12px; background-color: ${color}; border-radius: 50%;"></div>
            </div>
          </div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
  });
};

// Custom cluster icon creator function
const createClusterCustomIcon = (cluster: any) => {
  // Get all the markers in this cluster
  const markers = cluster.getAllChildMarkers();
  
  // Check if any marker is non-compliant
  const hasNonCompliant = markers.some((marker: any) => 
    marker.options.siteStatus === 'non-compliant'
  );
  
  // Check if any marker is warning (only if no non-compliant)
  const hasWarning = !hasNonCompliant && markers.some((marker: any) => 
    marker.options.siteStatus === 'warning'
  );
  
  // Determine the color based on priority: non-compliant > warning > compliant
  let color = '#22c55e'; // Default to compliant (green)
  
  if (hasNonCompliant) {
    color = '#ef4444'; // Red for non-compliant
  } else if (hasWarning) {
    color = '#eab308'; // Yellow for warning
  }
  
  // Create cluster icon with the appropriate color
  const count = cluster.getChildCount();
  const size = count < 10 ? 36 : count < 100 ? 42 : 48;
  
  return L.divIcon({
    html: `<div style="background-color: white; color: ${color}; width: ${size}px; height: ${size}px; display: flex; justify-content: center; align-items: center; border-radius: 50%; font-weight: bold; border: 3px solid ${color}; box-shadow: 0 3px 8px rgba(0,0,0,0.3);">
            <span style="color: #333; font-weight: 600; font-size: ${count < 10 ? '14px' : count < 100 ? '13px' : '12px'};">${count}</span>
          </div>`,
    className: 'custom-cluster-icon',
    iconSize: [size, size],
    iconAnchor: [size/2, size/2]
  });
};

// Default center coordinates for Australia (approximate center of Australia)
const DEFAULT_CENTER: [number, number] = [-25.2744, 133.7751];
const DEFAULT_ZOOM = 4;

// Map bounds setter component
const SetBoundsFromMarkers: React.FC<{ sites: GeocodedSite[] }> = ({ sites }) => {
  const map = useMap();
  
  useEffect(() => {
    // Wait a moment for the map to be ready
    const timer = setTimeout(() => {
      if (sites.length > 0) {
        console.log(`SetBoundsFromMarkers: Fitting map to ${sites.length} sites`);
        
        // Get valid markers with coordinates
        const markers = sites
          .filter(site => site.geocoded)
          .map(site => {
            console.log(`Including site in bounds: ${site.name} at ${site.geocoded}`);
            return site.geocoded;
          });
        
        if (markers.length > 0) {
          console.log(`Setting bounds for ${markers.length} markers:`, markers);
          
          // Create a bounds object and extend it with all marker positions
          const bounds = L.latLngBounds(markers);
          
          // Add larger padding to make sure all markers are visible with better spacing
          map.fitBounds(bounds, { 
            padding: [100, 100],
            maxZoom: 10, // Lower the max zoom level for better overview
            animate: true,
            duration: 1 // Longer animation for smoother transition
          });
          
          console.log('Focused map on', markers.length, 'locations with bounds:', bounds.toString());
        } else {
          // If no markers with coordinates, show default view of Australia
          map.setView(DEFAULT_CENTER as any, DEFAULT_ZOOM);
          console.log('No markers with valid coordinates found, showing default view');
        }
      }
    }, 300); // Longer delay to ensure map is fully ready
    
    return () => clearTimeout(timer);
  }, [map, sites]);
  
  return null;
};

// Helper function to fix coordinate order if needed
const fixCoordinateOrder = (coords: [number, number]): [number, number] => {
  // Sometimes OSM returns coordinates in [lng, lat] format instead of [lat, lng]
  // This function will check and fix the order if needed
  const [first, second] = coords;
  
  // Check if the first coordinate looks like a longitude (typically between -180 and 180)
  // and second looks like a latitude (typically between -90 and 90)
  if (Math.abs(first) <= 180 && Math.abs(first) > 90 && Math.abs(second) <= 90) {
    console.log('Swapping coordinates to correct [lat, lng] format');
    return [second, first];
  }
  
  return coords;
};

// Geocode an address to coordinates
const geocodeAddress = async (address: string): Promise<[number, number] | null> => {
  if (!address || address.trim() === '') {
    console.log('Empty address provided to geocodeAddress');
    return null;
  }

  // Check for caching
  try {
    const cacheKey = `geocode:${address}`;
    const cachedValue = localStorage.getItem(cacheKey);
    
    if (cachedValue) {
      try {
        const coordinates = JSON.parse(cachedValue) as [number, number];
        console.log(`Using cached coordinates for "${address}":`, coordinates);
        return coordinates;
      } catch (err) {
        console.warn('Error parsing cached coordinates:', err);
        // Continue with geocoding if parsing fails
      }
    }
  } catch (err) {
    console.warn('Error accessing cache:', err);
    // Continue with geocoding if local storage fails
  }
  
  console.log(`Geocoding address: "${address}"`);
  
  // First, check if the address already contains coordinates in the format "lat,lng"
  const coordsRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
  const match = address.match(coordsRegex);
  
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[3]);
    console.log(`Extracted coordinates from address: [${lat}, ${lng}]`);
    
    // Save to cache
    try {
      const coordinates: [number, number] = [lat, lng];
      localStorage.setItem(`geocode:${address}`, JSON.stringify(coordinates));
    } catch (err) {
      console.warn('Error saving to cache:', err);
    }
    
    return [lat, lng];
  }
  
  // Australian cities fallbacks (if geocoding fails)
  const australianCities: Record<string, [number, number]> = {
    'sydney': [-33.8688, 151.2093],
    'melbourne': [-37.8136, 144.9631],
    'brisbane': [-27.4698, 153.0251],
    'perth': [-31.9505, 115.8605],
    'adelaide': [-34.9285, 138.6007],
    'gold coast': [-28.0167, 153.4000],
    'newcastle': [-32.9283, 151.7817],
    'canberra': [-35.2809, 149.1300],
    'wollongong': [-34.4278, 150.8933],
    'hobart': [-42.8821, 147.3272],
    'australia': [-25.2744, 133.7751], // Center of Australia
  };
  
  // Search the address for city names
  const lowercaseAddress = address.toLowerCase();
  for (const [city, coords] of Object.entries(australianCities)) {
    if (lowercaseAddress.includes(city)) {
      console.log(`Using fallback coordinates for "${city}" found in address`);
      return coords;
    }
  }
  
  try {
    // Use Nominatim to geocode the address
    const encodedAddress = encodeURIComponent(address);
    const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`;
    
    console.log(`Requesting geocoding from: ${nominatimUrl}`);
    
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'Pretance Site Management Tool (https://pretance.com)'
      }
    });
    
    if (!response.ok) {
      console.error('Geocoding request failed:', response.statusText);
      
      // Try Australia fallback if geocoding fails
      console.log('Using Australia fallback coordinates');
      return australianCities['australia'];
    }
    
    const data = await response.json();
    console.log('Geocoding response:', data);
    
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      const coordinates: [number, number] = [lat, lon];
      
      console.log(`Geocoded "${address}" to:`, coordinates);
      
      // Save to cache
      try {
        localStorage.setItem(`geocode:${address}`, JSON.stringify(coordinates));
      } catch (err) {
        console.warn('Error saving to cache:', err);
      }
      
      return coordinates;
    } else {
      console.warn(`No results found for address: "${address}"`);
      
      // Try Australia fallback if no results
      console.log('Using Australia fallback coordinates');
      return australianCities['australia'];
    }
  } catch (error) {
    console.error('Error geocoding address:', error);
    
    // Try Australia fallback if there's an error
    console.log('Using Australia fallback coordinates due to error');
    return australianCities['australia'];
  }
};

// Site location map component
const SiteLocationMap: React.FC<{ sites: Site[] }> = ({ sites }) => {
  const [geocodedSites, setGeocodedSites] = useState<GeocodedSite[]>([]);
  const [geocodingStatus, setGeocodingStatus] = useState<'idle' | 'geocoding' | 'done'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Cast props to any to bypass TypeScript errors
  const mapProps: any = {
    center: DEFAULT_CENTER,
    zoom: DEFAULT_ZOOM,
    style: { width: '100%', height: '600px' },
    zoomControl: false,
    attributionControl: true,
    scrollWheelZoom: true,
    maxZoom: 18,
    minZoom: 2
  };

  const tileProps: any = {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxZoom: 18
  };
  
  // Filter sites based on search query and status filter
  const filteredSites = useMemo(() => {
    const filtered = geocodedSites.filter(site => {
      const matchesSearch = 
        !searchQuery || 
        site.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        site.address.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        !filterStatus || 
        site.complianceStatus === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
    
    console.log('Filtered sites:', filtered);
    console.log('Sites with valid geocoding:', filtered.filter(site => site.geocoded && typeof site.geocoded !== 'boolean').length);
    
    return filtered;
  }, [geocodedSites, searchQuery, filterStatus]);
  
  // Add refresh geocoding function
  const refreshGeocoding = useCallback(async () => {
    if (geocodingStatus === 'geocoding' || refreshing) return;
    
    setRefreshing(true);
    console.log('Refreshing geocoding for all sites...');
    
    try {
      // Clear existing geocoded sites
      setGeocodedSites([]);
      setGeocodingStatus('geocoding');
      
      // Re-fetch sites from Supabase to ensure we have the latest data
      const { data: freshSites, error } = await supabase
        .from('business_sites')
        .select('*');
        
      if (error) {
        console.error('Error fetching fresh sites:', error);
        throw error;
      }
      
      console.log(`Re-geocoding ${freshSites.length} sites...`);
      
      // Process the sites in batches
      const geocodedResults = await processSitesInBatches(freshSites as Site[], true);
      console.log(`Finished re-geocoding ${geocodedResults.length} sites`);
      
      setGeocodedSites(geocodedResults);
      setGeocodingStatus('done');
    } catch (error) {
      console.error('Error during refresh geocoding:', error);
    } finally {
      setRefreshing(false);
    }
  }, [geocodingStatus]);

  // Update the processSitesInBatches function to accept a forceRefresh parameter
  const processSitesInBatches = async (sitesToProcess: Site[], forceRefresh = false) => {
    const batchSize = 5;
    const delay = 1000; // 1 second delay between batches
    const results: GeocodedSite[] = [];
    
    console.log(`Processing ${sitesToProcess.length} sites in batches of ${batchSize}`);
    
    for (let i = 0; i < sitesToProcess.length; i += batchSize) {
      const batch = sitesToProcess.slice(i, i + batchSize);
      console.log(`Processing batch ${i / batchSize + 1} of ${Math.ceil(sitesToProcess.length / batchSize)}`);
      
      const batchPromises = batch.map(async (site) => {
        const cacheKey = `geocode_${site.address}`;
        let cachedResult = null;
        
        // Skip cache check if forceRefresh is true
        if (!forceRefresh) {
          try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
              cachedResult = JSON.parse(cached);
              console.log(`Using cached coordinates for "${site.address}": [${cachedResult[0]}, ${cachedResult[1]}]`);
            }
          } catch (err) {
            console.warn('Error reading from cache:', err);
          }
        }
        
        const coordinates = cachedResult || await geocodeAddress(site.address);
        
        if (coordinates && !cachedResult && !forceRefresh) {
          try {
            localStorage.setItem(cacheKey, JSON.stringify(coordinates));
          } catch (err) {
            console.warn('Error writing to cache:', err);
          }
        }
        
        return {
          ...site,
          geocoded: coordinates ? {
            lat: coordinates[0],
            lng: coordinates[1]
          } : undefined
        };
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      if (i + batchSize < sitesToProcess.length) {
        console.log(`Waiting ${delay}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    const geocodedCount = results.filter(site => site.geocoded).length;
    console.log(`Successfully geocoded ${geocodedCount} out of ${results.length} sites`);
    
    return results;
  };

  // Geocode addresses when component mounts
  useEffect(() => {
    const geocodeSites = async () => {
      setGeocodingStatus('geocoding');
      console.log('Starting geocoding for', sites.length, 'sites');
      console.log('Sites data:', sites);
      
      // First, let's count how many sites already have coordinates
      const sitesWithCoordinates = sites.filter(site => site.geocoded && typeof site.geocoded !== 'boolean').length;
      console.log(`Sites with coordinates already: ${sitesWithCoordinates}/${sites.length}`);
      
      if (sitesWithCoordinates === sites.length) {
        console.log('All sites already have coordinates, no geocoding needed');
        setGeocodedSites(sites as GeocodedSite[]);
        setGeocodingStatus('done');
        return;
      }

      // Process all sites to ensure geocoding
      const results = await processSitesInBatches(sites as Site[], false);
      console.log('Geocoding complete, results:', results);
      console.log('Sites with coordinates after geocoding:', 
        results.filter(site => site.geocoded && typeof site.geocoded !== 'boolean').length);
        
      setGeocodedSites(results);
      setGeocodingStatus('done');
    };
    
    if (sites.length > 0) {
      geocodeSites();
    } else {
      console.log('No sites to geocode');
      setGeocodedSites([]);
      setGeocodingStatus('done');
    }
  }, [sites]);
  
  if (geocodingStatus === 'geocoding' && geocodedSites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-gray-100 rounded-lg">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mb-4"></div>
        <p className="text-gray-600">Converting addresses to map coordinates...</p>
      </div>
    );
  }
  
  return (
    <div className="h-full w-full relative" style={{ minHeight: '600px' }}>
      <div className="absolute top-0 left-0 right-0 z-10 bg-white dark:bg-gray-800 p-4 flex items-center gap-4">
        <Input
          type="text"
          placeholder="Search sites..."
          className="px-4 py-2 w-full max-w-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1"
          >
            <Filter size={16} />
            <span>Filter</span>
          </Button>
          
          {searchQuery || filterStatus ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus(null);
              }}
              className="flex items-center gap-1"
            >
              <X size={16} />
              <span>Clear</span>
            </Button>
          ) : null}
        </div>
      </div>
      
      {showFilters && (
        <div className="absolute top-16 left-0 right-0 z-10 bg-white dark:bg-gray-800 p-4 flex flex-wrap items-center gap-3 border-t">
          <span className="text-sm font-medium">Status:</span>
          <Button
            variant={filterStatus === 'compliant' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(filterStatus === 'compliant' ? null : 'compliant')}
            className="flex items-center gap-1"
          >
            <CheckCircle size={16} className="text-green-500" />
            <span>Compliant</span>
          </Button>
          
          <Button
            variant={filterStatus === 'warning' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(filterStatus === 'warning' ? null : 'warning')}
            className="flex items-center gap-1"
          >
            <AlertTriangle size={16} className="text-yellow-500" />
            <span>Warning</span>
          </Button>
          
          <Button
            variant={filterStatus === 'non-compliant' ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus(filterStatus === 'non-compliant' ? null : 'non-compliant')}
            className="flex items-center gap-1"
          >
            <AlertOctagon size={16} className="text-red-500" />
            <span>Non-compliant</span>
          </Button>
        </div>
      )}
      
      <div className={`h-full w-full ${showFilters ? 'pt-32' : 'pt-16'}`} style={{ minHeight: '600px' }}>
        <MapContainer
          {...mapProps as any}
        >
          <ZoomControl position="bottomright" />
          <TileLayer
            {...tileProps as any}
          />
          
          <SetBoundsFromMarkers sites={filteredSites as GeocodedSite[]} />
          
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterCustomIcon}
          >
            {(() => {
              // Debug information
              const validSites = filteredSites
                .filter(site => site.geocoded && typeof site.geocoded !== 'boolean');
              
              console.log('Rendering map with sites:', validSites.length);
              if (validSites.length > 0) {
                console.log('Sites to render:', validSites.map(site => ({
                  name: site.name,
                  address: site.address,
                  coordinates: site.geocoded,
                  status: site.complianceStatus
                })));
              }
              
              return validSites.map(site => {
                const coords = site.geocoded as [number, number];
                const icon = createCustomIcon(site.complianceStatus);
                
                console.log(`Placing marker for ${site.name} at:`, coords);
                
                return (
                  <Marker
                    key={site.id}
                    position={coords}
                    // @ts-ignore - icon is valid but TypeScript doesn't recognize it
                    icon={icon}
                    // @ts-ignore - custom prop for cluster coloring
                    siteStatus={site.complianceStatus}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-semibold text-lg">{site.name}</h3>
                        <p className="text-gray-600">{site.address}</p>
                        <p className={`font-medium ${getStatusColorClass(site.complianceStatus)}`}>
                          Status: {site.complianceStatus.charAt(0).toUpperCase() + site.complianceStatus.slice(1)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                );
              });
            })()}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

const SiteLocations = () => {
  const navigate = useNavigate();
  const { signOut, userRole } = useAuth();
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [userMode, setUserMode] = useState<'management' | 'provider'>(() => {
    const savedMode = localStorage.getItem('userMode');
    return (savedMode === 'management' || savedMode === 'provider') ? savedMode : 'management';
  });

  useEffect(() => {
    fetchSites();
  }, []);

  const fetchSites = async () => {
    try {
      setIsLoading(true);
      
      console.log('Supabase client:', supabase);
      console.log('Attempting to fetch sites from business_sites table...');
      
      const { data, error } = await supabase
        .from('business_sites')
        .select('*');
        
      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to load sites: ' + error.message);
        setSites(FALLBACK_SITES);
        return;
      }
      
      console.log('Sites data retrieved from Supabase:', data);
      
      // Manually geocode the sites immediately for testing
      const geocodedSites = await Promise.all(data.map(async (site) => {
        // Try to get coordinates from the address field
        let geocoded: [number, number] | undefined = undefined;
        
        if (site.address) {
          try {
            const coords = await geocodeAddress(site.address);
            if (coords) {
              geocoded = coords;
              console.log(`Successfully geocoded ${site.name} to:`, coords);
            }
          } catch (e) {
            console.error(`Failed to geocode ${site.name}:`, e);
          }
        }
        
        return {
          id: site.id,
          name: site.name,
          address: site.address || '', 
          itemCount: site.item_count || 0,
          complianceStatus: (site.compliance_status || 'pending') as ComplianceStatus,
          assignedContractors: [],
          coordinates: site.coordinates || undefined,
          site_type: site.site_type || '',
          contact_email: site.contact_email || '',
          contact_phone: site.contact_phone || '',
          notes: site.notes || '',
          geocoded: geocoded // Use the coordinates we just geocoded
        };
      }));
      
      console.log('Mapped and geocoded sites:', geocodedSites);
      console.log('Sites with geocoding:', geocodedSites.filter(site => site.geocoded).length);
      
      setSites(geocodedSites);
    } catch (err) {
      console.error('Error fetching sites:', err);
      toast.error('An error occurred while loading sites');
      setSites(FALLBACK_SITES);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await signOut();
    if (!error) {
      navigate('/login');
    }
  };

  const handleImportClick = () => {
    setIsImportOpen(true);
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    fetchSites(); // Refresh the site list after import
  };

  const switchMode = () => {
    const newMode = userMode === 'management' ? 'provider' : 'management';
    localStorage.setItem('userMode', newMode);
    setUserMode(newMode);
  };

  return (
    <BusinessDashboard 
      switchRole={() => {}} 
      userRole={userRole || 'business'} 
      handleLogout={handleLogout} 
      userMode={userMode}
      switchMode={switchMode}
    >
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Site Locations</h1>
          <p className="text-gray-500">
            View and manage your business locations on an interactive map
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 p-1 mb-2">
            <TabsTrigger value="map" className="flex items-center gap-2 data-[state=active]:bg-white">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-white">
              <List className="h-4 w-4" />
              List View
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="map">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Site Location Map</CardTitle>
                <CardDescription>
                  View all your business sites on the map. Markers are color-coded based on compliance status. 
                  Click on markers to view site details or use the search and filters to find specific locations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center items-center h-[400px]">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                  </div>
                ) : sites.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6">
                    <MapPin className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No sites found</h3>
                    <p className="text-sm text-gray-500 max-w-md text-center">
                      Add sites with addresses to view them on the map.
                    </p>
                  </div>
                ) : (
                  <SiteLocationMap sites={sites} />
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="list">
            <Card className="border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle>Site Directory</CardTitle>
                <CardDescription>View and manage all your business locations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <SitesManagement 
                  portalType="business" 
                  onImportClick={handleImportClick}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Import Sites Modal */}
        <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
          <SiteImportModal 
            onClose={() => setIsImportOpen(false)}
            onSuccess={handleImportSuccess}
          />
        </Dialog>
      </div>
    </BusinessDashboard>
  );
};

export default SiteLocations;
