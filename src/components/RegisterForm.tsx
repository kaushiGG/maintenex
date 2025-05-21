import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { signUp } from '@/services/auth';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import Logo from '@/components/Logo';

interface RegisterFormProps {
  className?: string;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  className
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [userType, setUserType] = useState<'business' | 'contractor' | 'employee'>('contractor');
  const [formErrors, setFormErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isInvitedEmployee, setIsInvitedEmployee] = useState(false);
  const [invitationData, setInvitationData] = useState<any>(null);

  // Check for invitation token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');
    
    if (token && email) {
      validateInvitation(token, email);
    }
  }, [searchParams]);

  // Validate invitation token against database
  const validateInvitation = async (token: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('email', email)
        .eq('status', 'pending')
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Check if invitation has expired
        if (data.expires_at && new Date(data.expires_at) < new Date()) {
          toast.error('This invitation has expired. Please request a new invitation from your employer.');
          return;
        }
        
        // Set form data from invitation
        setFormData(prev => ({
          ...prev,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name
        }));
        
        // Force user type to employee for invitations
        setUserType('employee');
        setIsInvitedEmployee(true);
        setInvitationData(data);
        
        toast.success(`Welcome ${data.first_name}! Please complete your registration.`);
      } else {
        toast.error('Invalid or expired invitation. Please contact your employer.');
      }
    } catch (error: any) {
      console.error('Error validating invitation:', error);
      if (error.code === 'PGRST116') {
        toast.error('Invitation not found. Please check the link or contact your employer.');
      } else if (error.code === 'PGRST103') {
        toast.error('Invalid invitation format. Please contact your employer.');
      } else {
        toast.error('Could not validate invitation. Please try again or contact support.');
      }
    }
  };

  const validateForm = () => {
    let isValid = true;
    const errors = {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
      isValid = false;
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
      isValid = false;
    }
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
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }
    setFormErrors(errors);
    return isValid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const {
      name,
      value
    } = e.target;
    
    // Don't allow changing email for invited employees
    if (name === 'email' && isInvitedEmployee) {
      return;
    }
    
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

  const handleUserTypeChange = (value: string) => {
    // Don't allow changing user type for invited employees
    if (isInvitedEmployee) {
      return;
    }
    setUserType(value as 'business' | 'contractor' | 'employee');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const {
          data,
          error
        } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName, userType);
        
        if (error) {
          toast.error(error.message);
        } else {
          // Update invitation status if this is an invited employee
          if (isInvitedEmployee && invitationData) {
            await supabase
              .from('invitations')
              .update({ status: 'accepted' })
              .eq('id', invitationData.id);
          }
          
          // The database trigger will handle profile creation automatically
          toast.success('Account created successfully! Please check your email to confirm your account.', {
            style: {
              backgroundColor: '#FF6B45',
              color: 'white',
              border: 'none'
            }
          });
          setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
          });
          navigate('/login');
        }
      } catch (err: any) {
        toast.error(err.message || 'An error occurred during registration');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      toast.error('Please correct the errors in the form');
    }
  };

  return (
    <div className={cn('w-full max-w-md', className)}>
      <div className="flex flex-col items-center mb-6">
        {/* Block letter FORGEMATE logo inside the box */}
        <div className="mb-4 relative opacity-0 animate-fadeIn">
          <div className="relative">
            <div className="absolute -inset-1 rounded-md blur-md bg-gradient-to-r from-forgemate-gradient-start to-forgemate-gradient-end opacity-70 animate-pulse"></div>
            <div className="relative">
              <h1 className="text-4xl font-black tracking-widest text-white animate-fadeIn">FORGEMATE</h1>
            </div>
          </div>
        </div>
      </div>
      
      <h2 className="text-center text-xl text-forgemate-orange font-medium mb-6 opacity-0 animate-fadeIn animation-delay-100">
        {isInvitedEmployee ? 'Complete Your Registration' : 'Join'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="opacity-0 animate-fadeIn animation-delay-200">
            <Input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white" disabled={isSubmitting} />
            {formErrors.firstName && <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>}
          </div>
          
          <div className="opacity-0 animate-fadeIn animation-delay-300">
            <Input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white" disabled={isSubmitting} />
            {formErrors.lastName && <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>}
          </div>
        </div>
        
        <div className="opacity-0 animate-fadeIn animation-delay-400">
          <Input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Email" 
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white" 
            disabled={isSubmitting || isInvitedEmployee} 
          />
          {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
        </div>
        
        <div className="opacity-0 animate-fadeIn animation-delay-500">
          <Input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="Password" 
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white" 
            disabled={isSubmitting} 
          />
          {formErrors.password && <p className="text-red-500 text-xs mt-1">{formErrors.password}</p>}
        </div>
        
        <div className="opacity-0 animate-fadeIn animation-delay-600">
          <Input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            placeholder="Confirm Password" 
            className="w-full px-3 py-2 rounded-md border border-gray-800 bg-black placeholder:text-forgemate-orange/70 text-white" 
            disabled={isSubmitting} 
          />
          {formErrors.confirmPassword && <p className="text-red-500 text-xs mt-1">{formErrors.confirmPassword}</p>}
        </div>
        
        {!isInvitedEmployee && (
          <div className="opacity-0 animate-fadeIn animation-delay-700">
            <p className="text-sm text-white mb-2">I am registering as a:</p>
            <RadioGroup value={userType} onValueChange={handleUserTypeChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business" id="business" className="text-forgemate-orange border-gray-600" />
                <Label htmlFor="business" className="text-white">Business</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="contractor" id="contractor" className="text-forgemate-orange border-gray-600" />
                <Label htmlFor="contractor" className="text-white">Contractor</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="employee" id="employee" className="text-forgemate-orange border-gray-600" />
                <Label htmlFor="employee" className="text-white">Employee</Label>
              </div>
            </RadioGroup>
          </div>
        )}
        
        <div className="flex items-center mt-2 opacity-0 animate-fadeIn animation-delay-800">
          <input 
            type="checkbox" 
            id="terms" 
            className="mr-2 rounded text-forgemate-orange border-gray-600" 
            required 
          />
          <label htmlFor="terms" className="text-sm text-white">
            I agree to the <Link to="/terms" className="text-forgemate-orange-light hover:text-forgemate-orange">Terms of Service</Link> and <Link to="/privacy" className="text-forgemate-orange-light hover:text-forgemate-orange">Privacy Policy</Link>
          </label>
          </div>
        
        <Button
          type="submit"
          className="w-full py-2 bg-gradient-to-r from-forgemate-gradient-start via-forgemate-gradient-mid to-forgemate-gradient-end text-white font-medium rounded-md transition-all duration-300 opacity-0 animate-fadeIn animation-delay-900 forgemate-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
      
      <div className="mt-4 text-center opacity-0 animate-fadeIn animation-delay-900">
        <p className="text-white">
          Already have an account? <Link to="/login" className="text-forgemate-orange-light font-semibold hover:text-forgemate-orange transition-all duration-300">Sign In</Link>
        </p>
      </div>
      
      <div className="mt-8 text-center opacity-0 animate-fadeIn animation-delay-900">
        <p className="text-xs text-gray-600">
          Developed by Philotimo Global
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
