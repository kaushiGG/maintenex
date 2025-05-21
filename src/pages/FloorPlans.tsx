
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import FloorPlanManagement from '@/components/sites/floorplans/FloorPlanManagement';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import BusinessDashboardContent from '@/components/client/dashboard/BusinessDashboardContent';

interface FloorPlansProps {
  initialTab?: string;
}

const FloorPlans: React.FC<FloorPlansProps> = ({ initialTab = 'view' }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  
  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };
  
  return (
    <BusinessDashboardContent
      handleLogout={handleLogout}
      userRole="business"
      switchRole={null}
      userMode="management"
      userData={user}
    >
      <div className="container mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Floor Plans</h1>
        
        <FloorPlanManagement siteId={undefined} />
      </div>
    </BusinessDashboardContent>
  );
};

export default FloorPlans;
