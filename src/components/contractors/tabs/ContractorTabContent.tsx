
import React from 'react';
import BasicInfoTab from './BasicInfoTab';
import ContactTab from './ContactTab';
import LicensesTab from './LicensesTab';
import InsuranceTab from './InsuranceTab';
import AdditionalTab from './AdditionalTab';
import { Contractor } from '@/types/contractor';

interface ContractorTabContentProps {
  activeTab: string;
  contractor: Contractor;
  onUpdate: (contractorId: string, updates: Partial<Contractor>) => Promise<void>;
}

const ContractorTabContent: React.FC<ContractorTabContentProps> = ({
  activeTab,
  contractor,
  onUpdate
}) => {
  switch (activeTab) {
    case 'basic-info':
      return <BasicInfoTab contractor={contractor} onUpdate={onUpdate} />;
    case 'contact':
      return <ContactTab contractor={contractor} onUpdate={onUpdate} />;
    case 'licenses':
      return <LicensesTab contractor={contractor} />;
    case 'insurance':
      return <InsuranceTab contractor={contractor} />;
    case 'additional':
      return <AdditionalTab contractor={contractor} onUpdate={onUpdate} />;
    default:
      return <BasicInfoTab contractor={contractor} onUpdate={onUpdate} />;
  }
};

export default ContractorTabContent;
