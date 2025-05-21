import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'business' | 'contractor' | 'admin' | 'employee';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string, metadata: any) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
  userRole: UserRole | null;
  setSession: (session: Session | null) => void;
  setUserRole: (role: UserRole) => void;
  updateUserRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  signIn: async () => ({ error: null, data: null }),
  signUp: async () => ({ error: null, data: null }),
  signOut: async () => {},
  loading: true,
  userRole: null,
  setSession: () => {},
  setUserRole: () => {},
  updateUserRole: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
        } else {
          setSession(session);
          setUser(session?.user || null);
          
          // Determine user role from local storage or user metadata
          if (session?.user) {
            // Check local storage first for contractor specific flag
            const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
            
            if (isApprovedContractor) {
              setUserRole('contractor');
            } else {
              // Try to get from user metadata
              const metadataUserType = session.user.user_metadata?.userType as UserRole || null;
              // Try to get from local storage
              const localStorageUserRole = localStorage.getItem('userRole') as UserRole || null;
              
              setUserRole(metadataUserType || localStorageUserRole || null);
            }
          }
        }
      } catch (err) {
        console.error('Unexpected error in fetchSession:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
    
    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      setUser(session?.user || null);
      setSession(session);
      
      if (session?.user) {
        // Check local storage first for contractor specific flag
        const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
        
        if (isApprovedContractor) {
          setUserRole('contractor');
        } else {
          // Get from user metadata
          const userType = session.user.user_metadata?.userType as UserRole || null;
          setUserRole(userType || localStorage.getItem('userRole') as UserRole || null);
        }
      } else {
        setUserRole(null);
      }
    });
    
    return () => {
      if (authListener && typeof authListener.subscription.unsubscribe === 'function') {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('Error signing in:', error);
      return { error, data: null };
    }
    
    setUser(data.user);
    setSession(data.session);
    
    // Check if this is a contractor with approved status
    const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
    
    if (isApprovedContractor) {
      setUserRole('contractor');
    } else {
      const userType = data.user?.user_metadata?.userType as UserRole || null;
      setUserRole(userType || localStorage.getItem('userRole') as UserRole || null);
    }
    
    return { error: null, data };
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } });
    if (error) {
      console.error('Error signing up:', error);
      return { error, data: null };
    }
    
    setUser(data.user);
    setSession(data.session);
    setUserRole(metadata.userType as UserRole || null);
    
    return { error: null, data };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole(null);
    // Clear localStorage
    localStorage.removeItem('userRole');
    localStorage.removeItem('contractor_approved');
    localStorage.removeItem('contractor_user_id');
    localStorage.removeItem('contractor_email');
  };

  const updateUserRole = (role: UserRole) => {
    setUserRole(role);
    localStorage.setItem('userRole', role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      loading, 
      userRole, 
      setSession, 
      setUserRole,
      updateUserRole 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
