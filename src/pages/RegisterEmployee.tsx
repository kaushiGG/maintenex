import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { MailCheck, Loader2, CheckCircle2 } from 'lucide-react';
import Logo from '@/components/Logo';

interface InvitationDetails {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  status: string;
  expired: boolean;
}

const RegisterEmployee: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing invitation token');
      setIsLoading(false);
      return;
    }
    
    const fetchInvitation = async () => {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select('id, email, first_name, last_name, status, expires_at')
          .eq('token', token)
          .single();
          
        if (error || !data) {
          throw new Error('Invalid invitation token or invitation not found');
        }
        
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        const isExpired = expiresAt < now && data.status !== 'accepted';
        
        if (isExpired && data.status === 'pending') {
          // Update status to expired
          await supabase
            .from('invitations')
            .update({ status: 'expired' })
            .eq('id', data.id);
            
          data.status = 'expired';
        }
        
        if (data.status !== 'pending') {
          if (data.status === 'accepted') {
            setError('This invitation has already been used');
          } else if (data.status === 'expired') {
            setError('This invitation has expired');
          } else {
            setError('This invitation is no longer valid');
          }
          setIsLoading(false);
          return;
        }
        
        setInvitation({
          id: data.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          status: data.status,
          expired: isExpired
        });
        
        setFormData(prev => ({
          ...prev,
          email: data.email,
          firstName: data.first_name,
          lastName: data.last_name
        }));
        
      } catch (error: any) {
        console.error('Error fetching invitation:', error.message);
        setError(error.message || 'Failed to retrieve invitation details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitation();
  }, [token]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, agreeTerms: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.password || !formData.confirmPassword) {
      toast.error('Please enter a password');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (!formData.agreeTerms) {
      toast.error('You must agree to the terms and conditions');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Step 1: Create the user account with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });
      
      if (authError || !authData.user) {
        throw new Error(authError?.message || 'Failed to create account');
      }
      
      // Step 2: Call the function to register from the invitation
      const { data: funcData, error: funcError } = await supabase
        .rpc('register_from_invitation', {
          invitation_token: token,
          new_user_id: authData.user.id
        });
      
      if (funcError || funcData === false) {
        // Attempt to clean up the created user
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error(funcError?.message || 'Failed to register');
      }
      
      // Success - show success message
      setRegistered(true);
      
      // Sign out the automatically signed in user to allow them to verify their email
      await supabase.auth.signOut();
      
    } catch (error: any) {
      console.error('Registration error:', error.message);
      toast.error(error.message || 'Failed to register');
    } finally {
      setSubmitting(false);
    }
  };
  
  const goToLogin = () => {
    navigate('/login');
  };
  
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold">Verifying invitation</CardTitle>
            <CardDescription>Please wait while we verify your invitation</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center p-6">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <CardTitle className="text-2xl font-bold text-destructive">Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={goToLogin} className="w-full">
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (registered) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-6">
              <Logo />
            </div>
            <div className="flex justify-center mb-2">
              <CheckCircle2 className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
            <CardDescription>
              We've sent you an email with a verification link. Please check your inbox and verify your email before logging in.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button onClick={goToLogin} className="w-full">
              <MailCheck className="mr-2 h-4 w-4" />
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-6">
            <Logo />
          </div>
          <CardTitle className="text-2xl font-bold">Complete Your Registration</CardTitle>
          <CardDescription>
            You've been invited to join as an employee. Create your account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Create a secure password"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="agreeTerms" 
                checked={formData.agreeTerms}
                onCheckedChange={handleCheckboxChange}
              />
              <Label htmlFor="agreeTerms" className="text-sm text-muted-foreground cursor-pointer">
                I agree to the terms of service and privacy policy
              </Label>
            </div>
            
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={goToLogin}>
            Already have an account? Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RegisterEmployee; 