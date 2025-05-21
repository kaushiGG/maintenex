
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, PlusCircle, Building, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QRCodeScannerDialog } from './QRCodeScannerDialog';

interface SiteHeaderProps {
  site: any;
  service?: any;
  backLink: string;
  backText: string;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onQrScan?: (data: string) => void;
  showBackButton?: boolean;
}

export const SiteHeader = ({ 
  site, 
  service, 
  backLink, 
  backText,
  searchQuery,
  setSearchQuery,
  onQrScan,
  showBackButton = true
}: SiteHeaderProps) => {
  const navigate = useNavigate();
  
  const ServiceIcon = service?.icon;
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
      <div>
        {showBackButton && (
          <Button
            variant="ghost"
            onClick={() => navigate(backLink)}
            className="mb-2 -ml-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to {backText}
          </Button>
        )}
        
        {site && (
          <>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              {service ? (
                <>
                  {ServiceIcon && (
                    <div className={`p-2 rounded-md mr-2 ${service.color}`}>
                      <ServiceIcon className="h-5 w-5" />
                    </div>
                  )}
                  {service.name} - 
                </>
              ) : (
                <Building className="h-6 w-6 text-purple-600 mr-2" />
              )}
              {site.name}
            </h1>
            {service ? (
              <p className="text-gray-500 mt-1">Manage {service.name.toLowerCase()} for this site</p>
            ) : (
              <p className="text-gray-500 mt-1">{site.address}</p>
            )}
          </>
        )}
      </div>
      
      {searchQuery !== undefined && setSearchQuery && onQrScan && (
        <div className="mt-4 sm:mt-0 w-full sm:w-auto flex flex-col sm:flex-row gap-2">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search items..."
              className="pl-9 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <QRCodeScannerDialog onScan={onQrScan} />
          <Button className="bg-[#7851CA] hover:bg-[#6a46b5]">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Item
          </Button>
        </div>
      )}
    </div>
  );
};
