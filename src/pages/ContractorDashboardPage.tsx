import React, { useEffect, useState } from 'react';
import ContractorDashboardContent from '@/components/contractor/dashboard/ContractorDashboardContent';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ContractorDashboardPage = () => {
  const { user, signOut: contextSignOut, updateUserRole } = useAuth();
  const navigate = useNavigate();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  
  const handleLogout = async () => {
    try {
      // Clear special contractor flags
      localStorage.removeItem('contractor_approved');
      localStorage.removeItem('contractor_user_id');
      localStorage.removeItem('contractor_email');
      localStorage.removeItem('userRole');
      
      await contextSignOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  // Check if contractor is approved
  useEffect(() => {
    const checkApproval = async () => {
      if (loading) setLoading(true);
      
      // Check for special localStorage flag first (approved via auth flow)
      const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
      if (isApprovedContractor) {
        console.log('Contractor pre-approved from localStorage flag, granting access');
        setIsApproved(true);
        setLoading(false);
        return;
      }
      
      if (!user) {
        console.log('No user found, cannot check approval');
        setLoading(false);
        return;
      }

      try {
        console.log('Checking approval status in database for user:', user.id);
        
        // Check profile in database
        const { data, error } = await supabase
          .from('profiles')
          .select('is_approved, user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          
          if (error.code === 'PGRST116') {
            console.log('No profile found, creating one with default values');
            
            // Create a new profile for the user
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: user.id,
                email: user.email,
                user_type: 'contractor',
                is_approved: false,
                first_name: user.user_metadata?.firstName || '',
                last_name: user.user_metadata?.lastName || '',
              });
              
            if (insertError) {
              console.error('Error creating profile:', insertError);
            } else {
              console.log('Created new contractor profile');
            }
            
            setIsApproved(false);
            setLoading(false);
            return;
          }
          
          // Other errors
          setIsApproved(false);
          setLoading(false);
          return;
        }
        
        console.log('Profile data retrieved:', data);
        
        // Business users always get access
        if (data?.user_type === 'business') {
          console.log('Business user, auto-approving');
          setIsApproved(true);
          updateUserRole('business');
          setLoading(false);
          return;
        }
        
        // Check approval status
        const approved = data?.is_approved === true;
        console.log('Contractor approval status from database:', approved);
        
        // If approved, save to localStorage for future use
        if (approved) {
          localStorage.setItem('contractor_approved', 'true');
          localStorage.setItem('contractor_user_id', user.id);
          localStorage.setItem('contractor_email', user.email || '');
          localStorage.setItem('userRole', 'contractor');
          updateUserRole('contractor');
        }
        
        setIsApproved(approved);
        
      } catch (error) {
        console.error('Error in approval check:', error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    checkApproval();
  }, [user]);

  // Set contractor role to ensure we stay in contractor mode
  useEffect(() => {
    localStorage.setItem('userRole', 'contractor');
    updateUserRole('contractor');
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your contractor account is pending approval by a business user. You'll be able to access the contractor portal once your account has been approved.
            </p>
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ContractorDashboardContent
      userRole="contractor"
      handleLogout={handleLogout}
      userData={user}
    />
  );
};

export default ContractorDashboardPage;
