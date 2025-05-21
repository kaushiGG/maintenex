import { supabase } from '@/integrations/supabase/client';

export async function signIn(email: string, password: string) {
  try {
    console.log(`Attempting to sign in user: ${email}`);
    
    // Add timeout to detect network issues faster
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timed out. Please check your internet connection.')), 15000)
    );
    
    const authPromise = supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    // Race the auth request against the timeout
    const result: any = await Promise.race([authPromise, timeoutPromise]);
    const { data, error } = result;

    if (error) {
      console.error('Sign-in error:', error);
      return { data: null, error };
    }

    console.log('Sign in successful:', data);
    
    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected sign-in error:', error);
    
    // Specific error for network issues
    if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.message.includes('timed out')) {
      return { 
        data: null, 
        error: { 
          message: 'Unable to connect to authentication server. Please check your internet connection and try again.'
        } 
      };
    }
    
    return { 
      data: null, 
      error: { 
        message: error.message || 'Failed to connect to authentication service. Please check your internet connection and try again.'
      } 
    };
  }
}

export async function signUp(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
  userType: 'business' | 'contractor' | 'employee'
) {
  try {
    console.log(`Registering new ${userType} user: ${email}`);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          userType
        }
      }
    });

    if (error) {
      console.error('Sign-up error:', error);
      return { data: null, error };
    }

    console.log('Registration successful:', data);
    return { data, error: null };
  } catch (error: any) {
    console.error('Unexpected sign-up error:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Failed to connect to registration service. Please check your internet connection and try again.'
      } 
    };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign-out error:', error);
      return { success: false, error };
    }
    return { success: true, error: null };
  } catch (error: any) {
    console.error('Unexpected sign-out error:', error);
    return { 
      success: false, 
      error: { 
        message: error.message || 'Failed to sign out. Please try again.'
      } 
    };
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email
    });
    
    if (error) {
      console.error('Error resending verification email:', error);
    } else {
      console.log('Verification email resent successfully');
    }
    
    return { data, error };
  } catch (error: any) {
    console.error('Unexpected error resending verification:', error);
    return { 
      data: null, 
      error: { 
        message: error.message || 'Failed to resend verification email. Please try again later.'
      } 
    };
  }
}

// Add a simple function to check auth status
export async function checkAuthStatus() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Auth status check error:', error);
      return { session: null, error };
    }
    return { session, error: null };
  } catch (error: any) {
    console.error('Unexpected auth status error:', error);
    return { 
      session: null, 
      error: { 
        message: error.message || 'Failed to check authentication status.'
      } 
    };
  }
}

// Helper to get user from external commit (OAuth provider callback)
export async function handleExternalAuthCallback(maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error(`External auth callback error (attempt ${retries + 1}/${maxRetries}):`, error);
        retries++;
        
        if (retries < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
          continue;
        }
        
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error(`Unexpected external auth callback error (attempt ${retries + 1}/${maxRetries}):`, error);
      retries++;
      
      if (retries < maxRetries) {
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        continue;
      }
      
      return { 
        data: null, 
        error: { 
          message: error.message || 'Failed to process authentication provider response.'
        } 
      };
    }
  }
  
  // This shouldn't be reached, but just in case
  return { 
    data: null, 
    error: { 
      message: 'Failed to process authentication after multiple attempts.'
    } 
  };
}
