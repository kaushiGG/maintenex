import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, resendVerificationEmail } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';

interface LoginFormProps {
  className?: string;
}

// Create a connection check function since we're no longer using the one from lib/supabase
const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return { success: false, error: error.message };
    }
    return { success: true, data };
  } catch (err: any) {
    console.error('Unexpected error checking Supabase connection:', err);
    return { success: false, error: err.message || 'Unknown connection error' };
  }
};

const LoginForm: React.FC<LoginFormProps> = ({ className }) => {
  const navigate = useNavigate();
  const { setUserRole } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResendOption, setShowResendOption] = useState(false);
  const [lastAttemptedEmail, setLastAttemptedEmail] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: '',
  });

  // Check connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await checkSupabaseConnection();
        setConnectionStatus(result.success ? 'connected' : 'error');
        
        if (!result.success) {
          toast.error('Unable to connect to the server', {
            description: 'Please check your internet connection and try again.',
            duration: 5000
          });
        }
      } catch (err) {
        setConnectionStatus('error');
        toast.error('Connection check failed', {
          description: 'Please ensure you have an active internet connection.',
          duration: 5000
        });
      }
    };
    
    checkConnection();
  }, []);

  const validateForm = () => {
    let isValid = true;
    const errors = {
      email: '',
      password: '',
    };

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check connection before attempting login
    if (connectionStatus === 'error') {
      toast.error('Unable to connect to authentication server', {
        description: 'Please check your internet connection and try again.',
        duration: 5000
      });
      return;
    }
    
    if (validateForm()) {
      setIsSubmitting(true);
      setShowResendOption(false);
      setLastAttemptedEmail(formData.email);
      
      console.log('Attempting to sign in with email:', formData.email);
      
      try {
        const { data, error } = await signIn(formData.email, formData.password);
        
        if (error) {
          console.error('Login error:', error.message);

          if (error.message.toLowerCase().includes('email') && 
              (error.message.toLowerCase().includes('confirm') || 
               error.message.toLowerCase().includes('verification'))) {
            setShowResendOption(true);
            toast.error(error.message, {
              description: 'Please check your inbox and spam folder for the verification email.',
              duration: 5000
            });
          } else if (error.message.toLowerCase().includes('connect') || 
                    error.message.toLowerCase().includes('network') || 
                    error.message.toLowerCase().includes('internet')) {
            toast.error('Connection error', {
              description: error.message,
              duration: 5000
            });
            // Reset connection status to trigger another check on next attempt
            setConnectionStatus('checking');
          } else if (error.message.toLowerCase().includes('fetch')) {
            toast.error('Network connection error', {
              description: 'Unable to connect to authentication server. Please check your internet connection and try again.',
              duration: 5000
            });
          } else {
            toast.error(error.message);
          }
        } else {
          const isApprovedContractor = localStorage.getItem('contractor_approved') === 'true';
          const userType = isApprovedContractor ? 'contractor' : (data?.user?.user_metadata?.userType || 'contractor');
          setUserRole(userType as 'business' | 'contractor' | 'employee');
          
          console.log('Login successful, user type:', userType);
          
          toast.success('Signed in successfully!');
          
          setFormData({
            email: '',
            password: '',
          });
          
          if (userType === 'business') {
            navigate('/dashboard');
          } else if (userType === 'employee') {
            navigate('/employee-dashboard');
          } else {
            navigate('/contractor-dashboard');
          }
        }
      } catch (err: any) {
        console.error('Unexpected error during login:', err);
        toast.error('An unexpected error occurred. Please try again later.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Please correct the errors in the form.');
    }
  };

  const handleResendVerification = async () => {
    if (!lastAttemptedEmail) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await resendVerificationEmail(lastAttemptedEmail);
      
      if (error) {
        toast.error('Failed to resend verification email: ' + error.message);
      } else {
        toast.success('Verification email sent!', {
          description: 'Please check your inbox and spam folder.',
          duration: 5000
        });
        setShowResendOption(false);
      }
    } catch (err) {
      toast.error('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={cn('w-full max-w-md', className)}>
      {connectionStatus === 'error' && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative" role="alert">
          <strong className="font-bold">Connection Error! </strong>
          <span className="block sm:inline">Unable to connect to authentication server.</span>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full bg-red-50 hover:bg-red-100 text-red-700 border-red-300"
          >
            Retry Connection
          </Button>
        </div>
      )}
      
      <div className="flex flex-col items-center mb-6">
        {/* Block letter FORGEMATE logo inside the box */}
        <div className="mb-4 relative opacity-0 animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-1 rounded-md blur-md bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end opacity-70 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-4xl font-black tracking-widest text-white animate-float">FORGEMATE</h1>
            </div>
          </div>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="opacity-0 animate-fadeIn animation-delay-200">
          <Input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white"
            disabled={isSubmitting}
          />
          {formErrors.email && (
            <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
          )}
        </div>
        
        <div className="opacity-0 animate-fadeIn animation-delay-300 relative">
          <Input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white"
            disabled={isSubmitting}
          />
          {formErrors.password && (
            <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>
          )}
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-forgemate-orange-light hover:text-forgemate-orange">Forgot Password?</Link>
          </div>
        </div>
        
        <Button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-forgemate-gradient-start via-forgemate-gradient-mid to-forgemate-gradient-end text-white font-medium rounded-md transition-all duration-300 opacity-0 animate-fadeIn animation-delay-400 forgemate-button"
          disabled={isSubmitting || connectionStatus === 'error'}
        >
          {isSubmitting ? 'Signing In...' : 'Sign In'}
        </Button>
        
        {showResendOption && (
          <div className="text-center mt-4">
            <p className="text-sm text-forgemate-orange-light mb-2">
              Can't find the verification email?
            </p>
            <Button
              type="button"
              variant="outline"
              className="text-forgemate-orange border-forgemate-orange hover:bg-forgemate-orange/10"
              onClick={handleResendVerification}
              disabled={isSubmitting}
            >
              Resend Verification Email
            </Button>
          </div>
        )}
      </form>
      
      <div className="mt-4 text-center opacity-0 animate-fadeIn animation-delay-500">
        <p className="text-sm text-white">
          Don't have an account?{' '}
          <Link 
            to="/" 
            className="text-forgemate-orange-light font-semibold hover:text-forgemate-orange transition-all duration-300"
          >
            Sign Up
          </Link>
        </p>
      </div>
      
      <div className="mt-8 text-center opacity-0 animate-fadeIn animation-delay-500">
        <p className="text-xs text-gray-600">
          Developed by Philotimo Global
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
