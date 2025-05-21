## Auth System Fix Guide

The issue with the user registration process is that the trigger function in the database is not correctly capturing the user metadata from Supabase Auth, leading to incomplete profile information.

### The Problem

1. **Metadata Field Name Mismatch**: 
   - Your application sends metadata with fields like `firstName` and `lastName`
   - But the database trigger is looking for `first_name` and `last_name`

2. **Double Profile Creation**:
   - The RegisterForm component is trying to create a profile manually
   - The database trigger is also attempting to create a profile

### Solution

1. **Fix the Database Trigger**:
   - Run the `fix-user-profile-trigger.sql` script in the Supabase SQL Editor
   - This updates the trigger to use the correct metadata field names

2. **Ensure Profiles Table Exists**:
   - Run the `fix-profiles-table.sql` script in the Supabase SQL Editor
   - This ensures the profiles table is properly configured

3. **Fix RegisterForm Component**:
   - Remove the manual profile creation code from the component
   - The database trigger will handle profile creation automatically

Here's how to modify the RegisterForm component:

```tsx
// In src/components/RegisterForm.tsx

// Change this section of the handleSubmit function
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (validateForm()) {
    setIsSubmitting(true);
    try {
      const { data, error } = await signUp(formData.email, formData.password, formData.firstName, formData.lastName, userType);
      
      if (error) {
        toast.error(error.message);
      } else {
        // The database trigger will handle profile creation
        // We don't need to manually create a profile here
        toast.success('Account created successfully! Please check your email to confirm your account.', {
          style: {
            backgroundColor: '#7851CA',
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
```

### Testing

After making these changes:

1. Run the database SQL scripts
2. Register a new user through the application
3. Check the database to confirm the profile is being created correctly: 