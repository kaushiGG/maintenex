import React from 'react';
import ContractorAssignments from './ContractorAssignments';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface SiteAssignmentViewProps {
  siteId?: string;
}

/**
 * SiteAssignmentView - Component for business portal to view contractors assigned to sites
 * This is a read-only view that doesn't allow assignments to be modified
 */
const SiteAssignmentView: React.FC<SiteAssignmentViewProps> = ({ siteId }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* CardTitle removed to avoid duplicate title */}
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 mb-4">
            View which contractors are currently assigned to your sites. Each site can have multiple contractors
            to handle different service types or locations.
          </div>
          
          {/* Use the existing ContractorAssignments component in view-only mode */}
          <ContractorAssignments viewOnly={true} />
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteAssignmentView; 