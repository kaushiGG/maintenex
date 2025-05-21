import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BusinessDashboard from '@/components/BusinessDashboard';
import FloorPlanViewer from '@/components/sites/floorplans/FloorPlanViewer';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { checkFloorPlansTable, applySiteFloorPlansMigration } from '@/utils/migrations';
import { Button } from '@/components/ui/button';
import { Database, AlertTriangle } from 'lucide-react';

interface FloorPlansProps {
  initialTab?: string;
}

const FloorPlans: React.FC<FloorPlansProps> = ({ initialTab = 'upload' }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isTableReady, setIsTableReady] = useState<boolean | null>(null);
  const [checkingTable, setCheckingTable] = useState(true);
  
  // Get initialTab from the state if provided
  const activeTab = location.state?.initialTab || initialTab;
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  useEffect(() => {
    // Check if the site_floor_plans table exists
    const verifyTable = async () => {
      setCheckingTable(true);
      const tableExists = await checkFloorPlansTable();
      setIsTableReady(tableExists);
      setCheckingTable(false);
    };
    
    verifyTable();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleDownloadMigration = async () => {
    await applySiteFloorPlansMigration();
  };

  return (
    <BusinessDashboard 
      switchRole={() => {}} 
      userRole="business" 
      handleLogout={handleLogout}
      userMode="management"
    >
      {isTableReady === false && !checkingTable && (
        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <div className="flex-1">
              <p className="text-sm font-medium">Database setup required</p>
              <p className="text-xs">The floor plans database table is missing or not accessible.</p>
            </div>
            <Button 
              variant="outline" 
              className="ml-4" 
              onClick={handleDownloadMigration}
            >
              <Database className="h-4 w-4 mr-2" />
              Download SQL
            </Button>
          </div>
        </div>
      )}
      <FloorPlanViewer />
    </BusinessDashboard>
  );
};

export default FloorPlans;
