
import React from 'react';
import { ContactIcon, FileText, Info, Mail, Shield, UserCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BasicInfoTab from './tabs/BasicInfoTab';
import ContactTab from './tabs/ContactTab';
import LicensesTab from './tabs/LicensesTab';
import InsuranceTab from './tabs/InsuranceTab';
import AdditionalTab from './tabs/AdditionalTab';
import { Contractor } from '@/types/contractor';

interface ContractorManagementUIProps {
  contractor: Contractor;
  onUpdateContractor: (contractorId: string, updates: Partial<Contractor>) => Promise<void>;
}

const ContractorManagementUI: React.FC<ContractorManagementUIProps> = ({
  contractor,
  onUpdateContractor
}) => {
  const [activeTab, setActiveTab] = React.useState('basic-info');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-gray-800">{contractor.name}</h2>
        <div className="flex items-center mt-2 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-xs ${
            contractor.status === 'Active' 
              ? 'bg-green-100 text-green-800' 
              : contractor.status === 'Suspended' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
          }`}>
            {contractor.status}
          </span>
        </div>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full md:grid-cols-5 grid-cols-2 mb-8">
          <TabsTrigger value="basic-info" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            <span className="hidden md:inline">Basic Info</span>
            <span className="md:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <ContactIcon className="h-4 w-4" />
            <span>Contact</span>
          </TabsTrigger>
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            <span>Licenses</span>
          </TabsTrigger>
          <TabsTrigger value="insurance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Insurance</span>
          </TabsTrigger>
          <TabsTrigger value="additional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden md:inline">Additional</span>
            <span className="md:hidden">More</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic-info">
          <BasicInfoTab contractor={contractor} onUpdate={onUpdateContractor} />
        </TabsContent>
        
        <TabsContent value="contact">
          <ContactTab contractor={contractor} onUpdate={onUpdateContractor} />
        </TabsContent>
        
        <TabsContent value="licenses">
          <LicensesTab contractor={contractor} />
        </TabsContent>
        
        <TabsContent value="insurance">
          <InsuranceTab contractor={contractor} />
        </TabsContent>
        
        <TabsContent value="additional">
          <AdditionalTab contractor={contractor} onUpdate={onUpdateContractor} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContractorManagementUI;
