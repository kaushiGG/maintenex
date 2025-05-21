import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProfile } from '@/hooks/useProfile';

interface ApprovalCheckProps {
  children: React.ReactNode;
  redirectPath?: string;
}

export function ApprovalCheck({ children, redirectPath = '/pending-approval' }: ApprovalCheckProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  useEffect(() => {
    if (!loading && user && profile) {
      // Check if user is either a contractor or employee and not approved
      if ((profile.user_type === 'contractor' || profile.user_type === 'employee') && !profile.is_approved) {
        navigate(redirectPath);
      }
    }
  }, [user, profile, loading, navigate, redirectPath]);

  if (loading) {
    return null;
  }

  // Don't render children if user is contractor or employee and not approved
  if (!profile || ((profile.user_type === 'contractor' || profile.user_type === 'employee') && !profile.is_approved)) {
    return null;
  }

  return <>{children}</>;
}
