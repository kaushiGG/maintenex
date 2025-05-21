import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { UserPlus, FileText, Shield } from 'lucide-react';
import { ContractorsTable } from '../ContractorsTable';
import LicensesTab from './LicensesTab';
import InsuranceTab from './InsuranceTab';
import { Contractor } from '@/types/contractor';
import { Button } from '@/components/ui/button';

interface ContractorTabContentProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  filteredContractors: Contractor[];
  isLoading: boolean;
}
export const ContractorTabContent: React.FC<ContractorTabContentProps> = ({
  activeTab,
  setActiveTab,
  filteredContractors,
  isLoading
}) => {
  const handleViewContractor = (id: string) => {
    console.log('View contractor:', id);
    // Implement view logic here
  };

  const handleEditContractor = (id: string) => {
    console.log('Edit contractor:', id);
    // Implement edit logic here
  };

  const handleDeleteContractor = (id: string) => {
    console.log('Delete contractor:', id);
    // Implement delete logic here
  };

  return <Card className="shadow-sm">
      {isLoading ? <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div> : <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 border-b bg-transparent px-4">
            <TabsTrigger value="contractors" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-orange-500 text-orange-500 border-orange-500">
              <UserPlus className="mr-2 h-4 w-4" />
              Contractors
            </TabsTrigger>
            <TabsTrigger value="licenses" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-orange-500 text-orange-500 border-orange-500">
              <FileText className="mr-2 h-4 w-4" />
              Licenses
            </TabsTrigger>
            <TabsTrigger value="insurance" className="flex items-center data-[state=active]:border-b-2 data-[state=active]:border-orange-500 text-orange-500 border-orange-500">
              <Shield className="mr-2 h-4 w-4" />
              Insurance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="contractors" className="px-4 pb-4">
            {filteredContractors.length > 0 ? 
              <ContractorsTable 
                contractors={filteredContractors} 
                loading={isLoading}
                onView={handleViewContractor}
                onEdit={handleEditContractor}
                onDelete={handleDeleteContractor}
              /> : 
              <div className="text-center py-10">
                <p className="text-gray-500">No contractors found. Add a new contractor to get started.</p>
              </div>}
          </TabsContent>
          
          <TabsContent value="licenses" className="px-4 pb-4">
            <LicensesTab />
          </TabsContent>
          
          <TabsContent value="insurance" className="px-4 pb-4">
            <InsuranceTab />
          </TabsContent>
        </Tabs>}
    </Card>;
};