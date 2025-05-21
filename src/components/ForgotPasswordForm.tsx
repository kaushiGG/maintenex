import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Logo from './Logo';

interface ForgotPasswordFormProps {
  className?: string;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ className }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateEmail()) {
      setIsSubmitting(true);
      
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + '/login'
        });
        
        if (error) throw error;
        
        setResetSent(true);
        
        toast.success('Recovery instructions sent to your email!');
      } catch (error: any) {
        toast.error(error.message || 'Failed to send recovery instructions. Please try again.');
        console.error('Error sending password reset:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (resetSent) {
    return (
      <div className={cn('w-full max-w-md', className)}>
        <div className="flex flex-col items-center mb-6">
          <div className="mb-4 relative opacity-0 animate-fadeIn">
            <div className="relative">
              <div className="absolute -inset-1 rounded-md blur-md bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end opacity-70 animate-pulse"></div>
              <div className="relative">
                <h1 className="text-4xl font-black tracking-widest text-white animate-float">FORGEMATE</h1>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-forgemate-orange mb-2">Check Your Email</h1>
          <p className="text-center text-white text-sm max-w-xs">
            We've sent password recovery instructions to <span className="font-medium text-forgemate-orange-light">{email}</span>
          </p>
        </div>
        
        <div className="flex flex-col space-y-4">
          <Button
            onClick={() => setResetSent(false)}
            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-forgemate-orange-light font-medium rounded-md transition-all duration-300 opacity-0 animate-fadeIn animation-delay-400 forgemate-button"
          >
            Try another email
          </Button>
          
          <Link 
            to="/login"
            className="w-full text-center py-2 bg-gradient-to-r from-forgemate-gradient-start via-forgemate-gradient-mid to-forgemate-gradient-end text-white font-medium rounded-md transition-all duration-300 opacity-0 animate-fadeIn animation-delay-400 forgemate-button block"
          >
            Back to Sign In
          </Link>
        </div>
        
        <div className="mt-8 text-center opacity-0 animate-fadeIn animation-delay-500">
          <p className="text-xs text-gray-600">
            Developed by Philotimo Global
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col items-center mb-6">
        <div className="mb-4 relative opacity-0 animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-1 rounded-md blur-md bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end opacity-70 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-4xl font-black tracking-widest text-white animate-float">FORGEMATE</h1>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-forgemate-orange mb-2">Forgot Password</h1>
        <p className="text-center text-white text-sm max-w-xs">
          Enter your email and we'll send you instructions to reset your password
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="opacity-0 animate-fadeIn animation-delay-200">
          <Input
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white"
            disabled={isSubmitting}
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1">{emailError}</p>
          )}
        </div>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-gradient-to-r from-forgemate-gradient-start via-forgemate-gradient-mid to-forgemate-gradient-end text-white font-medium rounded-md transition-all duration-300 opacity-0 animate-fadeIn animation-delay-400 forgemate-button"
        >
          {isSubmitting ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      
      <div className="mt-4 text-center opacity-0 animate-fadeIn animation-delay-500">
        <Link 
          to="/login" 
          className="text-forgemate-orange-light font-medium hover:text-forgemate-orange transition-all duration-300"
        >
          Back to Sign In
        </Link>
      </div>
      
      <div className="mt-8 text-center opacity-0 animate-fadeIn animation-delay-500">
        <p className="text-xs text-gray-600">
          Developed by Philotimo Global
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
