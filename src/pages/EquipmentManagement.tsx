import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import EquipmentDashboard from '@/components/equipment/EquipmentDashboard';
import { Card } from '@/components/ui/card';

interface EquipmentManagementProps {
  portalType?: 'business' | 'contractor';
}

const EquipmentManagement: React.FC<EquipmentManagementProps> = ({ portalType = 'business' }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [hasError, setHasError] = useState(false);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Error boundary effect
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Error caught by error handler:', event.error);
      setHasError(true);
    };

    window.addEventListener('error', handleError);
    
    return () => window.removeEventListener('error', handleError);
  }, []);

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={() => {}}
        userRole="business"
        handleLogout={handleLogout}
        title="Equipment Management"
        portalType={portalType}
        userMode="management"
      />
      
      <div className="flex min-h-[calc(100vh-64px)]">
        <DashboardSidebar 
          handleLogout={handleLogout}
          portalType={portalType}
          userMode="management"
        />
        
        <main className="flex-1 p-6 bg-gray-50">
          {hasError ? (
            <Card className="p-6">
              <h1 className="text-2xl font-bold text-orange-600 mb-4">Equipment Management</h1>
              <p className="text-gray-500 mb-4">There was an error loading the equipment data.</p>
              <p className="text-sm text-gray-400">Please check the console for more details or contact support.</p>
            </Card>
          ) : (
            <ErrorBoundary>
              <EquipmentDashboard portalType={portalType} />
            </ErrorBoundary>
          )}
        </main>
      </div>
    </div>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-orange-600 mb-4">Equipment Management</h1>
          <p className="text-gray-500 mb-4">There was an error loading the equipment dashboard.</p>
          <p className="text-sm text-gray-400">Check the browser console for details.</p>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default EquipmentManagement;
