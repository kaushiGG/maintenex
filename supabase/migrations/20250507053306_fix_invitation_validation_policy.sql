-- Drop existing policy
DROP POLICY IF EXISTS "Employees can verify their invitation token" ON public.invitations;

-- Create updated policy for anyone to retrieve invitation by token
CREATE POLICY "Anyone can verify invitation token" ON public.invitations 
  FOR SELECT TO anon 
  USING (
    true
  );

-- Create policy for authenticated users to verify invitation token
CREATE POLICY "Authenticated users can verify invitation token" ON public.invitations 
  FOR SELECT TO authenticated 
  USING (
    true
  );
