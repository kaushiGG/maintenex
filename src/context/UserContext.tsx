
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';

export type UserRole = 'admin' | 'business' | 'contractor' | 'employee';

interface UserContextType {
  userRole: UserRole;
  setUserRole: React.Dispatch<React.SetStateAction<UserRole>>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(
    (user?.user_metadata?.userType as UserRole) || 'contractor'
  );

  return (
    <UserContext.Provider value={{ userRole, setUserRole }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
