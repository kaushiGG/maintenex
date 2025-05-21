import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClipboardCheck, ShieldCheck, History, AlertTriangle, Info, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import UpcomingSafetyChecks from '../safety/UpcomingSafetyChecks';

interface EmployeeDashboardContentProps {
  children?: React.ReactNode;
  handleLogout?: () => void;
  showBackButton?: boolean;
  backTo?: string;
  backText?: string;
  userData?: any;
}

const EmployeeDashboardContent: React.FC<EmployeeDashboardContentProps> = ({ 
  children, 
  handleLogout = () => {}, 
  showBackButton = false,
  backTo,
  backText,
  userData
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [equipment, setEquipment] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  
  const fullName = userData?.user_metadata?.firstName && userData?.user_metadata?.lastName
    ? `${userData.user_metadata.firstName} ${userData.user_metadata.lastName}`
    : userData?.email?.split('@')[0] || 'Employee';
  
  const email = userData?.email || 'employee@example.com';

  // Debug function to inspect authorised_officers column format
  useEffect(() => {
    const debugAuthorisedOfficers = async () => {
      try {
        console.log('Checking authorized_officers format...');
        const { data, error } = await supabase
          .from('equipment')
          .select('id, name, authorized_officers')
          .not('authorized_officers', 'is', null)
          .limit(5);
        
        if (error) {
          console.error('Debug query error:', error);
          return;
        }
        
        console.log('Sample authorized_officers data:', data);
        
        if (data && data.length > 0) {
          data.forEach(item => {
            console.log(`Equipment ${item.name} (${item.id}):`);
            console.log('  Type:', typeof item.authorized_officers);
            console.log('  Value:', item.authorized_officers);
            if (typeof item.authorized_officers === 'string') {
              try {
                const parsed = JSON.parse(item.authorized_officers);
                console.log('  Parsed JSON:', parsed);
              } catch (e) {
                console.log('  Not valid JSON');
              }
            }
          });
        } else {
          console.log('No equipment with authorized_officers found');
        }
      } catch (e) {
        console.error('Debug error:', e);
      }
    };
    
    debugAuthorisedOfficers();
  }, []);

  // Fetch equipment that needs safety checks
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        // Get equipment records
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .order('name');
        
        if (equipmentError) {
          throw equipmentError;
        }
        
        if (!equipmentData || equipmentData.length === 0) {
          setHasError(true);
          setErrorMessage('No equipment found in the database.');
          setEquipment([]);
          return;
        }
        
        // Filter equipment with safety data
        const equipmentWithSafety = equipmentData.filter(item => item.safety_frequency);
        
        if (equipmentWithSafety.length > 0) {
          setEquipment(equipmentWithSafety);
        } else {
          // If no equipment has safety data, show all equipment
          setEquipment(equipmentData);
          
          if (equipmentData.length > 0 && !equipmentData.some(item => item.safety_frequency)) {
            setHasError(true);
            setErrorMessage('Equipment found but missing safety frequency information.');
          }
        }
      } catch (error: any) {
        setHasError(true);
        setErrorMessage(error.message || 'Failed to load equipment data');
        toast.error('Failed to load equipment data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEquipment();
  }, []);

  // Navigate to safety check page for specific equipment
  const handlePerformSafetyCheck = (equipmentId: string) => {
    navigate(`/employee/safety-checks/${equipmentId}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <DashboardHeader 
        switchRole={null} 
        userRole="employee" 
        handleLogout={handleLogout} 
        title="Employee Safety Portal"
        portalType="employee"
        showBackButton={showBackButton}
        backTo={backTo}
        backText={backText}
        userData={{
          fullName,
          email,
          userType: 'employee'
        }}
      />
      
      <div className="min-h-[calc(100vh-64px)]">
        <main className="w-full p-4 bg-gray-50 overflow-x-hidden">
          {children || (
            <>
              <div className="bg-black rounded-xl p-6 mb-6 shadow-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h1 className="text-2xl font-bold mb-2 text-orange-500">Safety Checks</h1>
                    <p className="text-white">Manage safety checks for equipment and ensure compliance with safety standards.</p>
                  </div>
                </div>
              </div>

              {/* Scheduled Safety Checks Section */}
              <div className="mb-6">
                <UpcomingSafetyChecks />
              </div>

              {/* Equipment Safety Checks Section - REMOVED */}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboardContent; 