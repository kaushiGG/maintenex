import React from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ContractorsLayoutProps {
  children: React.ReactNode;
}

const ContractorsLayout = ({ children }: ContractorsLayoutProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={() => {}} 
        userRole="business" 
        handleLogout={handleLogout} 
        title="Contractors"
        portalType="business"
        userMode="management"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType="business"
          userMode="management"
        />
        
        <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 bg-gray-50 overflow-x-hidden">
          <div className="bg-white rounded-lg shadow-sm">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ContractorsLayout;
