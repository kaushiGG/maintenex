
import React from 'react';
import { Button } from '@/components/ui/button';
import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';

interface InventoryHeaderProps {
  siteName: string;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ siteName }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">
        {siteName ? `${siteName} Equipment` : 'Equipment Inventory'}
      </h2>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="outline"
          size="sm"
          asChild
        >
          <Link to="/dashboard/equipment/add">
            <Package className="mr-2 h-4 w-4" />
            Add Equipment
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default InventoryHeader;
