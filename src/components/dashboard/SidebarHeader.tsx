
import React from 'react';

interface SidebarHeaderProps {
  portalType: 'business' | 'contractor';
}

const SidebarHeader = ({ portalType }: SidebarHeaderProps) => {
  return (
    <div className="flex items-center mb-5">
      {portalType === 'contractor' ? (
        <div className="w-8 h-8 rounded-md bg-pretance-purple flex items-center justify-center text-white font-bold text-lg mr-2">
          M
        </div>
      ) : (
        <div className="w-8 h-8 rounded-md bg-pretance-purple flex items-center justify-center text-white font-bold text-lg mr-2">
          M
        </div>
      )}
      <span className="text-lg font-semibold text-pretance-purple">
        {portalType === 'business' ? 'Business Portal' : 'Contractor Portal'}
      </span>
    </div>
  );
};

export default SidebarHeader;
