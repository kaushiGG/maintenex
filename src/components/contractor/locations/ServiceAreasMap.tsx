import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@/components/ui/card';
import { MapPin, AlertTriangle, Clock, Calendar, CheckCircle, BriefcaseBusiness } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ServiceArea } from '@/services/serviceAreas';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

// Fix leaflet marker icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface ServiceAreasMapProps {
  serviceAreas: ServiceArea[];
}

interface JobLocation {
  id: string;
  title: string;
  status: string;
  service_type: string;
  created_at: string;
  coordinates: string;
  site_name: string;
  address: string;
}

const ServiceAreasMap = ({ serviceAreas }: ServiceAreasMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const circleLayersRef = useRef<{ [key: string]: L.Circle }>({}); // Store references to circle layers
  const markerLayersRef = useRef<{ [key: string]: L.CircleMarker }>({}); // Store references to marker layers
  const jobMarkersRef = useRef<{ [key: string]: L.Marker }>({}); // Store references to job markers
  
  const [selectedArea, setSelectedArea] = useState<ServiceArea | null>(null);
  const [jobsInSelectedArea, setJobsInSelectedArea] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(false);
  const [jobLocations, setJobLocations] = useState<JobLocation[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobLocation | null>(null);
  const [loadingJobLocations, setLoadingJobLocations] = useState<boolean>(false);

  // Fetch job locations when component mounts
  useEffect(() => {
    fetchJobLocations();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Create map if it doesn't exist
    if (!leafletMap.current) {
      leafletMap.current = L.map(mapRef.current).setView([-25.2744, 133.7751], 4);
      
      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(leafletMap.current);
    }
    
    // Clean up on unmount
    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, []);

  // Add service areas to map
  useEffect(() => {
    console.log('Map initialized:', !!leafletMap.current, 'Service areas count:', serviceAreas.length);
    if (!leafletMap.current || !serviceAreas.length) return;
    
    // Clear existing layers
    Object.values(circleLayersRef.current).forEach(layer => {
      if (leafletMap.current) leafletMap.current.removeLayer(layer);
    });
    Object.values(markerLayersRef.current).forEach(layer => {
      if (leafletMap.current) leafletMap.current.removeLayer(layer);
    });
    
    circleLayersRef.current = {};
    markerLayersRef.current = {};
    
    // Add new layers for each service area
    serviceAreas.forEach(area => {
      console.log('Processing area:', area.name, 'Coordinates:', area.coordinates);
      const [lat, lng] = area.coordinates.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) {
        console.error('Invalid coordinates for area:', area.name, area.coordinates);
        return;
      }
      const fillColor = area.status === 'active' ? '#f97316' : '#f59e0b';
      
      // Add circle for service area radius
      const circle = L.circle([lat, lng], {
        radius: area.radius * 1000,
        fillColor: fillColor,
        fillOpacity: 0.2,
        color: fillColor,
        weight: 1
      }).addTo(leafletMap.current!);
      
      // Add marker at center
      const marker = L.circleMarker([lat, lng], {
        radius: 8,
        fillColor: fillColor,
        color: '#ffffff',
        weight: 1,
        fillOpacity: 1
      }).addTo(leafletMap.current!);
      
      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-medium">${area.name}</h3>
          <p>${area.radius} km radius</p>
          <p>Status: ${area.status}</p>
        </div>
      `);
      
      // Add click handler
      marker.on('click', () => {
        setSelectedArea(area);
        setSelectedJob(null); // Clear selected job when selecting area
        
        if (leafletMap.current) {
          leafletMap.current.flyTo([lat, lng], 10, {
            duration: 1
          });
        }
      });
      
      // Store references
      circleLayersRef.current[area.id] = circle;
      markerLayersRef.current[area.id] = marker;
    });
    
    // Fit bounds to show all areas if there's more than one
    if (serviceAreas.length > 1) {
      const bounds = L.latLngBounds(
        serviceAreas.map(area => {
          const [lat, lng] = area.coordinates.split(',').map(Number);
          return [lat, lng];
        })
      );
      leafletMap.current.fitBounds(bounds, { padding: [50, 50] });
    } else if (serviceAreas.length === 1) {
      // Zoom to the single area
      const [lat, lng] = serviceAreas[0].coordinates.split(',').map(Number);
      leafletMap.current.setView([lat, lng], 10);
    }
  }, [serviceAreas]);

  // Handle selected area changes
  useEffect(() => {
    if (selectedArea) {
      fetchJobsInArea(selectedArea);
      
      // Highlight selected area
      const marker = markerLayersRef.current[selectedArea.id];
      if (marker) {
        marker.setStyle({
          weight: 2,
          fillOpacity: 1
        });
      }
    } else {
      setJobsInSelectedArea([]);
    }
    
    // Reset styles for non-selected areas
    serviceAreas.forEach(area => {
      if (area.id !== selectedArea?.id) {
        const marker = markerLayersRef.current[area.id];
        if (marker) {
          marker.setStyle({
            weight: 1,
            fillOpacity: 1
          });
        }
      }
    });
  }, [selectedArea]);

  const fetchJobsInArea = async (area: ServiceArea) => {
    setLoadingJobs(true);
    try {
      // Get jobs that are in the selected service area's postcodes
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          id, 
          title,
          status,
          service_type,
          created_at,
          client_id
        `)
        .eq('status', 'pending')
        .limit(5);
        
      if (error) throw error;
      
      setJobsInSelectedArea(data || []);
    } catch (error) {
      console.error('Error fetching jobs in area:', error);
      setJobsInSelectedArea([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchJobLocations = async () => {
    setLoadingJobLocations(true);
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('Current user:', user);
      
      if (userError || !user) {
        console.error('Error fetching user:', userError);
        return;
      }
      
      // Get contractor ID
      let contractorId;
      
      // Try with auth_id first (most commonly used)
      const { data: contractorByAuth } = await supabase
        .from('contractors')
        .select('id')
        .eq('auth_id', user.id)
        .single();
      
      console.log('Contractor by auth_id:', contractorByAuth);
      
      if (contractorByAuth) {
        contractorId = contractorByAuth.id;
      } else {
        // Try with owner_id next
        const { data: contractorByOwner } = await supabase
          .from('contractors')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        
        console.log('Contractor by owner_id:', contractorByOwner);
        
        if (contractorByOwner) {
          contractorId = contractorByOwner.id;
        }
      }
      
      if (!contractorId) {
        console.log('No contractor found for user:', user.id);
        return;
      }
      
      console.log('Found contractor ID:', contractorId);
      
      // Fetch jobs assigned to the contractor
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select(`
          id, 
          title,
          status,
          service_type,
          created_at,
          site_id,
          business_sites (
            id,
            name,
            address,
            coordinates
          )
        `)
        .eq('contractor_id', contractorId);
        
      if (jobsError) {
        console.error('Error fetching jobs:', jobsError);
        return;
      }
      
      console.log('Jobs data:', jobsData);
      
      // Process the job locations
      const locations = jobsData
        ?.filter(job => job.business_sites)
        .map(job => {
          const site = job.business_sites as any;
          return {
            id: job.id,
            title: job.title || `Job #${job.id.substring(0, 8)}`,
            status: job.status,
            service_type: job.service_type || 'Service',
            created_at: job.created_at,
            coordinates: site.coordinates,
            site_name: site.name,
            address: site.address
          };
        }) || [];
      
      console.log('Processed job locations:', locations);
      
      setJobLocations(locations);
      
    } catch (error) {
      console.error('Error fetching job locations:', error);
    } finally {
      setLoadingJobLocations(false);
    }
  };

  // Add job locations to map
  useEffect(() => {
    if (!leafletMap.current || !jobLocations.length) return;
    
    // Clear existing job markers
    Object.values(jobMarkersRef.current).forEach(marker => {
      if (leafletMap.current) leafletMap.current.removeLayer(marker);
    });
    
    jobMarkersRef.current = {};
    
    // Custom job marker icon
    const jobIcon = L.divIcon({
      html: `<div class="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full border-2 border-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24]
    });
    
    // Add markers for each job location
    jobLocations.forEach(job => {
      if (!job.coordinates) return;
      
      const [lat, lng] = job.coordinates.split(',').map(Number);
      if (isNaN(lat) || isNaN(lng)) return;
      
      // Create job marker
      const marker = L.marker([lat, lng], { 
        icon: jobIcon 
      }).addTo(leafletMap.current!);
      
      // Add popup
      marker.bindPopup(`
        <div class="p-2">
          <div class="font-medium">${job.title || 'Job'}</div>
          <div class="text-sm text-gray-600">${job.site_name || 'Site'}</div>
          <div class="text-xs mt-1">${job.service_type || 'Service'}</div>
          <div class="text-xs mt-1">Status: ${job.status}</div>
            </div>
      `);
      
      // Add click handler
      marker.on('click', () => {
        setSelectedJob(job);
        setSelectedArea(null); // Clear selected area when selecting job
      });
      
      // Store reference
      jobMarkersRef.current[job.id] = marker;
    });
  }, [jobLocations]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-4 left-4 z-[1000] bg-white bg-opacity-90 p-3 rounded-md shadow-md border border-orange-200">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
            <span className="text-sm">Service Area</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-black mr-2"></div>
            <span className="text-sm">Job Location</span>
          </div>
        </div>
      </div>
      
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg"
      />
      
      {selectedArea && (
        <Card className="absolute bottom-4 right-4 w-80 z-[1000] p-4 bg-white shadow-lg border-orange-200">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium text-black">{selectedArea.name}</h3>
              <div className="flex items-center mt-1 text-sm">
                <MapPin className="h-4 w-4 text-orange-500 mr-1" />
                <span className="text-gray-500">{selectedArea.radius} km radius</span>
              </div>
            </div>
            <Badge className={selectedArea.status === 'active' ? 'bg-orange-500' : 'bg-amber-500'}>
              {selectedArea.status === 'active' ? 'Active' : 'Pending'}
            </Badge>
            <button 
              className="text-gray-400 hover:text-gray-600 ml-2"
              onClick={() => setSelectedArea(null)}
            >
              ✕
            </button>
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Available Jobs</p>
            
            {loadingJobs ? (
              <div className="flex justify-center items-center h-16">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
              </div>
            ) : jobsInSelectedArea.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {jobsInSelectedArea.map(job => (
                  <div 
                    key={job.id} 
                    className="p-2 rounded-md bg-orange-50 border border-orange-100 hover:border-orange-200 cursor-pointer"
                  >
                    <h4 className="text-sm font-medium text-black">{job.title || `Job #${job.id.substring(0, 8)}`}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{job.service_type || 'Service'}</span>
                      <span className="text-xs text-orange-600">{format(new Date(job.created_at), 'dd MMM yyyy')}</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-2 text-orange-600 border-orange-200 hover:bg-orange-50">
                  View All Jobs
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <p className="text-sm text-gray-500">No jobs available in this area</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-500">Area Postcodes: {selectedArea.postcodes}</span>
          </div>
        </Card>
      )}

      {selectedJob && (
        <Card className="absolute bottom-4 right-4 w-80 z-[1000] p-4 bg-white shadow-lg border-orange-200">
          <div className="flex justify-between items-start">
            <div className="flex-1 mr-2">
              <h3 className="font-medium text-black">{selectedJob.title}</h3>
              <div className="flex items-center mt-1 text-sm">
                <BriefcaseBusiness className="h-4 w-4 text-black mr-1" />
                <span className="text-gray-700">{selectedJob.site_name || 'Site'}</span>
              </div>
            </div>
            <Badge className={
              selectedJob.status === 'completed' ? 'bg-green-500' : 
              selectedJob.status === 'in_progress' ? 'bg-blue-500' : 'bg-orange-500'
            }>
              {selectedJob.status}
            </Badge>
            <button 
              className="text-gray-400 hover:text-gray-600 ml-2"
              onClick={() => setSelectedJob(null)}
            >
              ✕
            </button>
          </div>
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                <span className="text-sm text-gray-600">{selectedJob.address || 'Address not available'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{format(new Date(selectedJob.created_at), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{selectedJob.service_type}</span>
              </div>
            </div>
            <Button 
              className="w-full mt-4 bg-orange-500 hover:bg-orange-700 text-white" 
              size="sm"
            >
              View Job Details
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ServiceAreasMap;
