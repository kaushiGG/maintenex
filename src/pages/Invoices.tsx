
import React from 'react';
import InvoicesPage from '@/components/invoices/InvoicesPage';

const Invoices = () => {
  const handleLogout = () => {
    // Logout logic would go here
    console.log('Logging out...');
  };

  return <InvoicesPage handleLogout={handleLogout} userRole="contractor" />;
};

export default Invoices;
