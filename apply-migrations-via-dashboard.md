# Applying the Employee Invitation Status Update Migration

This migration adds a trigger that automatically changes the status of employee invitations from "pending" to "approved" when a business user approves an employee profile in the User Approval dashboard.

## Instructions for Applying the Migration

1. Log in to your Supabase dashboard at [app.supabase.com](https://app.supabase.com)
2. Navigate to your project
3. Go to the **SQL Editor** section
4. Create a new query
5. Copy and paste the contents of the following migration file:
   - `supabase/migrations/20240508_update_invitations_on_approval.sql`
6. Click **Run** to execute the query

## Verifying the Migration

After applying the migration, you can verify it was successful by:

1. In the Supabase dashboard, go to the **Table Editor**
2. Navigate to the `public.profiles` table 
3. Check if the trigger `profile_approval_update_invitation` exists in the "Triggers" tab

## Testing the Migration

To test the functionality:

1. Create a new employee invitation (this should have status "pending")
2. Register a new employee user with the invitation
3. Go to Settings > User Approval and approve the employee
4. Verify that the corresponding invitation status is automatically changed to "approved"

## Rollback Instructions (if needed)

If you need to roll back this migration, execute the following SQL in the SQL Editor:

```sql
DROP TRIGGER IF EXISTS profile_approval_update_invitation ON public.profiles;
DROP FUNCTION IF EXISTS update_invitation_on_profile_approval();
``` 