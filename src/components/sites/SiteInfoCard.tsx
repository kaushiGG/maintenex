
import React from 'react';
import { Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SiteInfoCardProps {
  site: any;
}

export const SiteInfoCard = ({ site }: SiteInfoCardProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center">
          <Building className="h-5 w-5 text-[#7851CA] mr-2" />
          <div>
            <p className="font-medium">{site.name}</p>
            <p className="text-sm text-gray-500">{site.address}</p>
          </div>
        </div>
        <div className="mt-2 md:mt-0 flex items-center gap-3">
          <div className="text-sm">
            <span className="text-gray-500">Last inspection: </span>
            <span className="font-medium">{new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Next due: </span>
            <span className="font-medium">{new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
          </div>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
