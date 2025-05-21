
import React from 'react';
import InvoicesAndPaymentsPage from '@/components/financial/InvoicesAndPaymentsPage';

const InvoicesAndPayments = () => {
  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
  };

  return <InvoicesAndPaymentsPage handleLogout={handleLogout} userRole="business" />;
};

export default InvoicesAndPayments;
