import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmployeeDashboardContent from '@/components/employee/dashboard/EmployeeDashboardContent';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const EmployeeDashboardPage = () => {
  const navigate = useNavigate();
  const { user, signOut, userRole, setUserRole } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean | null>(null);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Check if the employee is approved
  useEffect(() => {
    const checkApproval = async () => {
      if (!user) {
        setIsApproved(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_approved, user_type')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error checking approval status:', error);
          setIsApproved(false);
          return;
        }

        // Ensure the user is an employee and is approved
        if (data.user_type === 'employee' && data.is_approved === true) {
          setIsApproved(true);
        } else {
          setIsApproved(false);
        }
      } catch (error) {
        console.error('Error in approval check:', error);
        setIsApproved(false);
      }
    };

    checkApproval();
  }, [user]);

  // Set employee role to ensure we stay in employee mode
  useEffect(() => {
    localStorage.setItem('userRole', 'employee');
  }, []);

  if (isApproved === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isApproved) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Account Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Your employee account is pending approval by a business user. You'll be able to access the employee portal once your account has been approved.
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
    <>
      <EmployeeDashboardContent
        handleLogout={handleLogout}
        userData={user}
      />
    </>
  );
};

export default EmployeeDashboardPage; 