
import React, { useState } from 'react';
import { ContractorSearch } from './search/ContractorSearch';
import { ContractorHeader } from './header/ContractorHeader';
import { ContractorTabContent } from './tabs/ContractorTabContent';
import AddContractorDialog from './AddContractorDialog';
import { useContractors } from './hooks/useContractors';
import { filterContractors } from './utils/contractorFilterUtils';
import { Contractor } from '@/types/contractor';
import { Dialog } from '@/components/ui/dialog';
import ContractorImportModal from './ContractorImportModal';

const ContractorManagementUI = () => {
  const [activeTab, setActiveTab] = useState('contractors');
  const [isAddContractorOpen, setIsAddContractorOpen] = useState(false);
  const [isImportContractorsOpen, setIsImportContractorsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  const { 
    contractors, 
    isLoading, 
    addContractor,
    refreshContractors
  } = useContractors();

  const handleAddNewContractor = () => {
    setIsAddContractorOpen(true);
  };

  const handleAddContractor = async (newContractor: Omit<Contractor, 'id'>) => {
    const success = await addContractor(newContractor);
    if (success) {
      setIsAddContractorOpen(false);
    }
    return success;
  };

  const handleImportContractors = () => {
    setIsImportContractorsOpen(true);
  };

  const handleImportSuccess = () => {
    refreshContractors();
    setIsImportContractorsOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleFilterChange = (value: string) => {
    setFilterStatus(value);
  };

  const filteredContractors = filterContractors(contractors, searchTerm, filterStatus);

  return (
    <div className="space-y-6">
      <ContractorHeader 
        onAddContractor={handleAddNewContractor}
        onImportContractors={handleImportContractors}
      />
      
      {activeTab === 'contractors' && (
        <ContractorSearch 
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
      )}
      
      <ContractorTabContent 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        filteredContractors={filteredContractors}
        isLoading={isLoading}
      />

      <Dialog open={isAddContractorOpen} onOpenChange={setIsAddContractorOpen}>
        <AddContractorDialog 
          open={isAddContractorOpen}
          onOpenChange={setIsAddContractorOpen}
          onAddContractor={handleAddContractor}
        />
      </Dialog>

      <Dialog open={isImportContractorsOpen} onOpenChange={setIsImportContractorsOpen}>
        <ContractorImportModal 
          onClose={() => setIsImportContractorsOpen(false)}
          onSuccess={handleImportSuccess}
        />
      </Dialog>
    </div>
  );
};

export default ContractorManagementUI;
