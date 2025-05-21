
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserContextType {
  userRole: 'business' | 'contractor' | 'admin' | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType>({
  userRole: null,
  isLoading: true,
});

export const useUser = () => useContext(UserContext);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<'business' | 'contractor' | 'admin' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getUserRole = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Get user type from profiles table
          const { data, error } = await supabase
            .from('profiles')
            .select('user_type')
            .eq('id', user.id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setUserRole(data.user_type as 'business' | 'contractor' | 'admin' || 'contractor');
          } else {
            setUserRole('contractor'); // Default role
          }
        } else {
          setUserRole(null);
        }
      } catch (error) {
        console.error('Error getting user role:', error);
        setUserRole(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    getUserRole();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async () => await getUserRole()
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return (
    <UserContext.Provider value={{ userRole, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
