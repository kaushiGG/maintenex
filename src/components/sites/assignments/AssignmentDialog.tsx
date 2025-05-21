
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Site } from '@/types/site';
import { Contractor } from '@/types/contractor';
import ContractorAssignmentForm from '../ContractorAssignmentForm';

interface AssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sites: Site[];
  contractors: Contractor[];
  selectedSite: Site | null;
  selectedContractor: string;
  onSiteChange: (siteId: string) => void;
  onContractorChange: (contractor: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

const AssignmentDialog: React.FC<AssignmentDialogProps> = ({
  open,
  onOpenChange,
  sites,
  contractors,
  selectedSite,
  selectedContractor,
  onSiteChange,
  onContractorChange,
  onSubmit,
  isLoading,
  isEditing,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <ContractorAssignmentForm
          sites={sites}
          contractors={contractors}
          selectedSite={selectedSite}
          selectedContractor={selectedContractor}
          onSiteChange={onSiteChange}
          onContractorChange={onContractorChange}
          onCancel={() => onOpenChange(false)}
          onSubmit={onSubmit}
          isLoading={isLoading}
          isEditing={isEditing}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AssignmentDialog;
