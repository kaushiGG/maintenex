import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

// This must be a server-side endpoint, NEVER expose your service role key in client code
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(
  req: NextApiRequest, 
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, firstName, lastName, role, department, isSafetyOfficer, inviterId } = req.body

    if (!email || !firstName || !lastName || !inviterId) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // First, send the invitation email using Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        first_name: firstName,
        last_name: lastName,
        user_type: 'employee'
      }
    })

    if (authError) {
      console.error('Auth invite error:', authError)
      return res.status(500).json({ error: `Failed to send invitation: ${authError.message}` })
    }

    // Then, store the additional employee data in the invitations table
    const { error: dbError } = await supabaseAdmin
      .from('invitations')
      .insert([{
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        department,
        is_safety_officer: isSafetyOfficer,
        invitation_type: 'employee',
        inviter_id: inviterId,
        status: 'pending',
        // We don't need to generate a token, as Supabase Auth handles this
      }])

    if (dbError) {
      console.error('Database error:', dbError)
      return res.status(500).json({ error: `Failed to store invitation data: ${dbError.message}` })
    }

    // Return success response
    return res.status(200).json({ success: true, message: `Invitation sent to ${email}` })
  } catch (error: any) {
    console.error('Server error:', error)
    return res.status(500).json({ error: error.message || 'An unexpected error occurred' })
  }
} 