import { supabase } from '@/integrations/supabase/client';
import { UserMode } from '@/components/dashboard/sidebar/hooks/useSidebarLinks';

/**
 * Deletes an invitation by ID
 * This function uses a stored procedure to bypass RLS policies if needed
 * @param invitationId The ID of the invitation to delete
 * @returns Promise with the result of the operation
 */
export async function deleteInvitationById(invitationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Call the stored procedure/function via RPC
    const { data, error } = await supabase.rpc('delete_invitation_by_id', {
      invitation_id: invitationId,
    });

    if (error) {
      console.error('Error deleting invitation via RPC:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: unknown) {
    console.error('Exception when deleting invitation:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Fetches jobs based on user role and mode
 * - For business users in provider mode: shows only jobs assigned to them
 * - For contractors: shows jobs assigned to them
 * - For business users in management mode: shows all jobs
 * 
 * @param userId The current user's ID
 * @param userRole The user's role (business or contractor)
 * @param userMode The user's mode (management or provider)
 * @returns Promise with the fetched jobs
 */
export async function fetchUserJobs(
  userId: string,
  userRole: 'business' | 'contractor',
  userMode: UserMode = 'provider'
) {
  try {
    // First get user profile to get name and email for matching
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', userId)
      .single();
      
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
    }
    
    // Prepare possible values for assigned_to field lookup
    const fullName = profileData ? 
      `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : '';
    const firstName = profileData?.first_name || '';
    const lastName = profileData?.last_name || '';
    const email = profileData?.email || '';
    
    // Build query to fetch jobs
    let query = supabase
      .from('jobs')
      .select(`
        *,
        sites:site_id(name, address)
      `)
      .order('due_date', { ascending: true });
    
    // If provider mode (either business or contractor) or contractor role
    // Only show jobs assigned to the user
    if (userMode === 'provider' || userRole === 'contractor') {
      console.log('Fetching jobs for provider mode with these identifiers:', {
        userId,
        fullName,
        firstName,
        lastName,
        email
      });
      
      // Build the OR condition for assigned_to matches
      // This checks if assigned_to equals any of the user's identifiers
      let orConditions = [];
      
      // Helper function to safely escape string values for PostgreSQL
      const escapeValue = (val: string) => {
        // Remove any single quotes and wrap the value in single quotes
        return `'${val.replace(/'/g, "''")}'`;
      };
      
      if (userId) orConditions.push(`assigned_to.eq.${escapeValue(userId)}`);
      if (fullName) orConditions.push(`assigned_to.eq.${escapeValue(fullName)}`);
      if (email) orConditions.push(`assigned_to.eq.${escapeValue(email)}`);
      if (firstName) orConditions.push(`assigned_to.ilike.${escapeValue(`%${firstName}%`)}`);
      if (lastName) orConditions.push(`assigned_to.ilike.${escapeValue(`%${lastName}%`)}`);
      
      // Also try including case where assigned_to might contain the email username part
      if (email) {
        const emailUsername = email.split('@')[0];
        if (emailUsername) orConditions.push(`assigned_to.ilike.${escapeValue(`%${emailUsername}%`)}`);
      }
      
      // Combine the OR conditions and apply to the query
      const orConditionsStr = orConditions.join(',');
      
      // If we have OR conditions, add them to the query
      if (orConditions.length > 0) {
        query = query.or(orConditionsStr);
        console.log(`Using OR conditions: ${orConditionsStr}`);
      } else {
        // Fallback to just userId if we have no other identifiers
        query = query.eq('assigned_to', userId);
        console.log(`Falling back to assigned_to = ${userId}`);
      }
    } else {
      // For business users in management mode, show all jobs
      console.log('Fetching all jobs (management mode)');
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
    
    return { data, error: null };
  } catch (error: unknown) {
    console.error('Exception in fetchUserJobs:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { data: null, error: errorMessage };
  }
} 