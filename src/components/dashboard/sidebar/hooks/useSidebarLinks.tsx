import React from 'react';
import { 
  HomeIcon, 
  UserCircle, 
  Building, 
  Info, 
  Settings, 
  LifeBuoy,
  Users,
  FolderOpen,
  Briefcase,
  Calendar,
  Package
} from 'lucide-react';

// Add user mode type to control UI visibility
export type UserMode = 'management' | 'provider';

export const useCommonSidebarLinks = (
  portalType: 'business' | 'contractor',
  userMode: UserMode = 'management' // Default to management mode
) => {
  const commonLinks = [
    { to: '/settings', icon: Settings, title: 'Settings' },
    { to: '/help', icon: LifeBuoy, title: 'Help & Support' },
  ];

  // For business users in management mode, show all management features
  if (portalType === 'business' && userMode === 'management') {
    return [
      { to: '/dashboard', icon: HomeIcon, title: 'Dashboard' },
      { to: '/user-management', icon: UserCircle, title: 'User Management', role: 'business' },
      { to: '/contractor-management', icon: Users, title: 'Contractor Management', role: 'business' },
      { to: '/documents', icon: FolderOpen, title: 'Document Control', role: 'business' },
      { to: '/assets', icon: Package, title: 'Asset Management', role: 'business' },
      { to: '/about', icon: Info, title: 'About' },
      ...commonLinks,
    ];
  }
  
  // For business users in provider mode, show a limited set of features
  if (portalType === 'business' && userMode === 'provider') {
    return [
      { to: '/dashboard', icon: HomeIcon, title: 'Dashboard' },
      { to: '/business/provider/jobs', icon: Briefcase, title: 'My Assigned Jobs' },
      { to: '/schedule', icon: Calendar, title: 'My Schedule' },
      { to: '/profile', icon: UserCircle, title: 'My Profile' },
      { to: '/about', icon: Info, title: 'About' },
      ...commonLinks,
    ];
  }

  // Contractor links - pointing to contractor-specific dashboard
  return [
    { to: '/contractor-dashboard', icon: HomeIcon, title: 'Dashboard', role: 'contractor' },
    { to: '/contractor/jobs', icon: Briefcase, title: 'My Jobs' },
    { to: '/contractor/schedule', icon: Calendar, title: 'My Schedule' },
    { to: '/profile', icon: UserCircle, title: 'My Profile' },
    { to: '/about', icon: Info, title: 'About' },
    ...commonLinks,
  ];
};
