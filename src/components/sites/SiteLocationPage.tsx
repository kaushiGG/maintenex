
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tag, Zap, AlertTriangle, Thermometer, Flame, AirVent, Wrench, BugOff, 
  ClipboardList, Lightbulb, Building } from 'lucide-react';
import { mockSites, serviceTypes, generateMockItems } from './mockSiteData';
import { SiteHeader } from './SiteHeader';
import { SiteInfoCard } from './SiteInfoCard';
import { ServiceCardsList } from './ServiceCardsList';
import { SiteItemsList } from './SiteItemsList';

// Create a map of service type keys to Lucide icon components
const iconMap = {
  'Tag': Tag,
  'Zap': Zap,
  'AlertTriangle': AlertTriangle,
  'Thermometer': Thermometer,
  'Flame': Flame,
  'AirVent': AirVent,
  'Wrench': Wrench,
  'BugOff': BugOff,
  'ClipboardList': ClipboardList,
  'Building': Building,
  'Lightbulb': Lightbulb
};

const SiteLocationPage = () => {
  const { siteId, serviceType } = useParams<{ siteId: string; serviceType: string }>();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const site = siteId && mockSites[siteId as keyof typeof mockSites];
  
  // Get the service with the icon component mapped
  const service = serviceType ? {
    ...serviceTypes[serviceType as keyof typeof serviceTypes],
    icon: iconMap[serviceTypes[serviceType as keyof typeof serviceTypes]?.icon as keyof typeof iconMap]
  } : null;
  
  const handleViewTestingService = (type: string) => {
    if (!site) return;
    
    if (type === 'test-a-tag') {
      navigate(`/services/test-a-tag?siteId=${siteId}&siteName=${encodeURIComponent(site.name)}`);
    } else if (type === 'rcd') {
      navigate(`/services/rcd-testing?siteId=${siteId}&siteName=${encodeURIComponent(site.name)}`);
    } else if (type === 'emergency-exit') {
      navigate(`/services/emergency-exit-lighting?siteId=${siteId}&siteName=${encodeURIComponent(site.name)}&siteAddress=${encodeURIComponent(site?.address || '')}`);
    }
  };
  
  const allItems = useMemo(() => {
    if (!siteId || !serviceType) return [];
    return generateMockItems(siteId, serviceType);
  }, [siteId, serviceType]);
  
  const filteredItems = allItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.itemNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleQRScan = (data: string) => {
    console.log("QR Code scanned:", data);
    setSearchQuery(data);
  };
  
  // Site dashboard without specific service selected
  if (siteId && !serviceType) {
    return (
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <SiteHeader 
            site={site}
            backLink="/sites"
            backText="Sites"
          />
          
          {site ? (
            <ServiceCardsList siteId={siteId} siteName={site.name} />
          ) : (
            <div className="flex justify-center items-center h-96">
              <p>Site not found</p>
            </div>
          )}
        </div>
      </div>
    );
  }
  
  // Error state if site or service not found
  if (!site || !service) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Site or service not found</p>
      </div>
    );
  }
  
  // Site with specific service selected
  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <SiteHeader 
          site={site}
          service={service}
          backLink={`/sites/${siteId}`}
          backText={site.name}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onQrScan={handleQRScan}
        />
        
        <SiteInfoCard site={site} />
        
        <SiteItemsList 
          items={filteredItems}
          handleViewTestingService={handleViewTestingService}
          serviceType={serviceType}
        />
      </div>
    </div>
  );
};

export default SiteLocationPage;
