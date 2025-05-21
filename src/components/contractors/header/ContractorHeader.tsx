
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, Upload } from 'lucide-react';
interface ContractorHeaderProps {
  onAddContractor: () => void;
  onImportContractors: () => void;
}
export const ContractorHeader: React.FC<ContractorHeaderProps> = ({
  onAddContractor,
  onImportContractors
}) => {
  return <div className="flex justify-between items-center mb-6">
      <h1 className="text-2xl font-bold text-forgemate-dark">Contractor Management</h1>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onImportContractors} className="border-forgemate-purple text-forgemate-purple bg-forgemate-light/50 hover:bg-forgemate-light">
          <Upload className="mr-2 h-4 w-4" />
          Import Contractors
        </Button>
        <Button onClick={onAddContractor} className="bg-forgemate-purple hover:bg-forgemate-dark">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Contractor
        </Button>
      </div>
    </div>;
};
