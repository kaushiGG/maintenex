
import React from 'react';
import ComplianceOverview from '@/components/dashboard/ComplianceOverview';
import ContractorPerformance from '@/components/dashboard/ContractorPerformance';

const ComplianceAndContractors = () => {
  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 mb-3">
      <ComplianceOverview />
      <ContractorPerformance />
    </div>
  );
};

export default ComplianceAndContractors;
