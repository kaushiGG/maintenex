
import React from 'react';
import ContractorApproval from '@/components/admin/ContractorApproval';

const metadata = {
  title: 'Contractor Approval | Pretance',
  description: 'Approve or reject contractor profiles',
};

export default function ApprovalPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Contractor Approval</h1>
      <ContractorApproval />
    </div>
  );
}
