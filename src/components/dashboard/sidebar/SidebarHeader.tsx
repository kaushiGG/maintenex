import React from 'react';

interface SidebarHeaderProps {
  portalType: 'business' | 'contractor' | 'employee';
}

const SidebarHeader = ({ portalType }: SidebarHeaderProps) => {
  // Get the appropriate portal title based on portal type
  const getPortalTitle = () => {
    switch (portalType) {
      case 'business':
        return 'Business Portal';
      case 'contractor':
        return 'Contractor Portal';
      case 'employee':
        return 'Employee Portal';
      default:
        return 'Forgemate Portal';
    }
  };

  return (
    <div className="flex items-center mb-5">
      <div className="w-8 h-8 rounded-md bg-forgemate-purple flex items-center justify-center text-white font-bold text-lg mr-2">
        M
      </div>
      <span className="text-lg font-semibold text-forgemate-purple">
        {getPortalTitle()}
      </span>
    </div>
  );
};

export default SidebarHeader;
