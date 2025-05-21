import React from 'react';
import { Building } from 'lucide-react';

export const ContractorsHeader = () => {
  return (
    <header className="bg-orange-500 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        <div className="flex items-center">
          <Building className="h-8 w-8 mr-3" />
          <h1 className="text-2xl font-bold">Contractor Management</h1>
        </div>
      </div>
    </header>
  );
};
