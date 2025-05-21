
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Building } from 'lucide-react';

interface SiteInfoCardProps {
  siteName: string | null;
  siteAddress?: string | null;
}

const SiteInfoCard: React.FC<SiteInfoCardProps> = ({ siteName, siteAddress }) => {
  if (!siteName) return null;
  
  return (
    <Card className="mb-6">
      <CardContent className="p-4 flex flex-col">
        <div className="flex items-center">
          <Building className="h-5 w-5 text-purple-600 mr-2" />
          <span className="font-medium">Site: {siteName}</span>
        </div>
        {siteAddress && (
          <span className="text-sm text-gray-500 mt-1 ml-7">{siteAddress}</span>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteInfoCard;
