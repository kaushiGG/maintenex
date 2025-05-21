
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ContractorReportingModule from '@/components/contractor/reporting/ContractorReportingModule';

const ContractorReportsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Ensure we're in contractor mode
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'contractor') {
      localStorage.setItem('userRole', 'contractor');
    }
    
    // Redirect to completed report if directly accessing reports page
    if (location.pathname === '/reports') {
      navigate('/reports/completed');
    }
  }, [location.pathname, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userMode');
    navigate('/login');
  };

  return (
    <ContractorReportingModule
      userRole="contractor"
      handleLogout={handleLogout}
    />
  );
};

export default ContractorReportsPage;
