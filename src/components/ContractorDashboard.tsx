import React, { ReactNode } from 'react';
import ContractorDashboardContent from './contractor/dashboard/ContractorDashboardContent';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { signOut } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';

interface ContractorDashboardProps {
  userRole: 'business' | 'contractor';
  handleLogout: () => void;
  children?: ReactNode;
  switchRole?: () => void;
}

const ContractorDashboard = ({ 
  userRole, 
  handleLogout,
  children,
  switchRole = () => {}
}: ContractorDashboardProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogoutClick = async () => {
    try {
      await signOut();
      handleLogout();
      toast.success('Logged out successfully', {
        style: {
          backgroundColor: '#4B9CD3',
          color: 'white',
          border: 'none',
        },
        duration: 3000,
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Ensure we stay in contractor mode
  const ensureContractorRole = () => {
    localStorage.setItem('userRole', 'contractor');
  };

  // Call this effect to ensure contractor mode
  React.useEffect(() => {
    ensureContractorRole();
  }, []);

  return (
    <ContractorDashboardContent
      userRole="contractor"
      handleLogout={handleLogoutClick}
      userData={user}
      children={children}
    />
  );
};

export default ContractorDashboard;
