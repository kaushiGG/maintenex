
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ServiceStats {
  jobsCompleted: number;
  activeContractors: number;
  complianceRate: number;
}

interface ServiceItemProps {
  id: number;
  title: string;
  description: string;
  icon: LucideIcon;
  stats: ServiceStats;
  category: string;
  route: string;
}

interface ServiceCardProps {
  service: ServiceItemProps;
  onViewDetails: () => void;
  onCreateJob: () => void;
}

const ServiceCard = ({ service, onViewDetails, onCreateJob }: ServiceCardProps) => {
  const { title, description, icon: Icon, stats } = service;

  return (
    <Card className="overflow-hidden border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-[#7851CA]/10 text-[#7851CA]">
              <Icon size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
            <div>
              <p className="text-lg font-bold">{stats.jobsCompleted}</p>
              <p className="text-xs text-gray-500">Jobs Completed</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.activeContractors}</p>
              <p className="text-xs text-gray-500">Active Contractors</p>
            </div>
            <div>
              <p className="text-lg font-bold">{stats.complianceRate}%</p>
              <p className="text-xs text-gray-500">Compliance Rate</p>
            </div>
          </div>
        </div>

        <div className="flex border-t border-gray-200 divide-x divide-gray-200">
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none py-2 h-10 text-sm font-medium hover:bg-gray-50"
            onClick={onViewDetails}
          >
            View Details
          </Button>
          <Button 
            variant="ghost" 
            className="flex-1 rounded-none py-2 h-10 text-sm font-medium text-[#7851CA] hover:bg-[#7851CA]/5"
            onClick={onCreateJob}
          >
            Create Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
