
import React from 'react';
import ServiceAreasPage from '@/components/contractor/locations/ServiceAreasPage';

const ServiceAreas = () => {
  const handleLogout = () => {
    // Logout logic would go here
  };

  return (
    <ServiceAreasPage 
      handleLogout={handleLogout}
      userRole="contractor"
    />
  );
};

export default ServiceAreas;
